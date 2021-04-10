import React, { useRef, useState } from 'react'

// Components
import Node from './Node'
import Toolbar from './Toolbar'
// Functions
import {
    GetRowsCols, fillMatrix,
    pickRandomFreeNode
} from './functions/helperMethods'
import {
    turnToWall,
    isMovingStart, isMovingEnd, moveStart, moveEnd
} from './functions/handlers'
import generateMaze from './functions/generateMaze'
import { breadthFirstSearch } from './functions/breadthFirstSearch'

function Grid() {

    const [rows, cols] = GetRowsCols();

    const matrix = fillMatrix(rows, cols, false);
    // Global State Variables
    const [startNode, setStartNode] = useState(undefined);
    const [endNode, setEndNode] = useState(undefined);

    const [isChoosingStart, setIsChoosingStart] = useState(false);
    const [isChoosingEnd, setIsChoosingEnd] = useState(false);

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [algoRunning, setAlgoRunning] = useState(false);
    // Graph Wall Representation
    const [walls, setWalls] = useState(matrix);
    const [finalPath, setFinalPath] = useState(undefined);
    // DOM Refs
    const refCollection = useRef(matrix.map(rows => rows.map(_ => React.createRef())));
    // Async
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    let grid = matrix.map((rows, i) => rows.map((_, j) => <Node
        // Globals
        key={[i, j]}
        coord={[i, j]}
        startNode={startNode}
        endNode={endNode}
        isChoosingStart={isChoosingStart}
        isChoosingEnd={isChoosingEnd}
        isMouseDown={isMouseDown}
        // Individuals
        isWall={walls?.[i]?.[j]}
        // Function passed to child
        isMovingStart={() => isMovingStart(setIsMouseDown, setIsChoosingStart)}
        isMovingEnd={() => isMovingEnd(setIsMouseDown, setIsChoosingEnd)}
        turnToWall={() => turnToWall([i, j], isChoosingEnd,
            isChoosingStart, algoRunning, finalPath,
            refCollection, setFinalPath, walls, setWalls)}
        moveStart={(coord) => moveStart(coord, algoRunning, finalPath, refCollection,
            walls, endNode, setStartNode)}
        moveEnd={(coord) => moveEnd(coord, algoRunning, finalPath, refCollection,
            walls, startNode, setEndNode)}
        ref={refCollection.current?.[i]?.[j]}
    ></Node>))

    async function createMazeAndAnimate() {
        setWalls(fillMatrix(rows, cols, true));
        setStartNode(undefined);
        setEndNode(undefined);
        setFinalPath(undefined);

        const [orderCarved, walls] = generateMaze(rows, cols);

        orderCarved.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className = 'node';
            }, i * 8);
        })

        await delay(orderCarved.length * 8);

        setWalls(walls);

    }

    async function bfsAnimate() {
        setAlgoRunning(true);

        let [traversalOrder, shortestPath] = breadthFirstSearch(
            walls, startNode, endNode, rows, cols);

        traversalOrder.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className =
                    'node traversed';
            }, i * 15);
        })

        await delay(traversalOrder.length * 15);

        traversalOrder.forEach(([y, x], i) => {
            refCollection.current[y][x].current.className = 'node';
        })

        shortestPath?.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className =
                    'node shortest-path';
            }, i * 8);
        })

        refCollection.current[endNode[0]][endNode[1]].current.className =
            'node goal';
        setFinalPath(shortestPath);
        setAlgoRunning(false)

    }

    return (
        <>
            <Toolbar
                generateMaze={createMazeAndAnimate}
                clearGrid={() => {
                    setWalls(fillMatrix(rows, cols, false))
                    refCollection.current.forEach(row => {
                        row.forEach(ref => {
                            ref.current.className = 'node';
                        })
                    })
                    setFinalPath(undefined);
                    setStartNode(undefined);
                    setEndNode(undefined);
                }}
                pickRandomStart={() => pickRandomFreeNode(walls, setStartNode,
                    refCollection, finalPath)}
                pickRandomEnd={() => pickRandomFreeNode(walls, setEndNode,
                    refCollection, finalPath)}
                startBfs={() => (!startNode || !endNode ?
                    alert('Please Pick a Start and a Goal Node!!') : bfsAnimate())}
            />
            <div
                onMouseDown={() => {
                    setIsMouseDown(true)

                }}
                onMouseUp={() => {
                    setIsMouseDown(false);
                    setIsChoosingStart(false);
                    setIsChoosingEnd(false);
                }}
                className='grid'
            >
                {grid.map((row, i) => (
                    <div key={i} className='board-row'>{row}</div>))}
            </div>
        </>
    )
}

export default Grid
