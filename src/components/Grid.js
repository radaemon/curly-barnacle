import React, { useRef, useState } from 'react'

// Components
import Node from './Node'
import Toolbar from './Toolbar'
// Functions
import {
    GetRowsCols, fillMatrix,
    pickRandomFreeNode
} from './functions/helperMethods'
import generateMaze from './functions/generateMaze'
import { breadthFirstSearch } from './functions/breadthFirstSearch'

function Grid() {

    const [rows, cols] = GetRowsCols();
    const matrix = fillMatrix(rows, cols, false);
    // Global State Variables
    const [startNode, setStartNode] = useState(undefined);
    const [goalNode, setGoalNode] = useState(undefined);
    const [isMouseDown, setIsMouseDown] = useState(false);
    // Graph Wall Representation
    const [isWall, setWall] = useState(matrix);
    const [finalPath, setFinalPath] = useState(undefined);

    const refCollection = useRef(matrix.map(rows => rows.map(_ => React.createRef())));

    let grid = matrix.map((rows, i) => rows.map((_, j) => <Node
        // Globals
        key={[i, j]}
        coord={[i, j]}
        ref={refCollection.current?.[i]?.[j]}
        startNode={startNode}
        goalNode={goalNode}
        isMouseDown={isMouseDown}
        // Individuals
        isWall={isWall?.[i]?.[j]}
        // Function passed to child
        turnToWall={turnToWall}
    ></Node>))

    function turnToWall([i, j]) {
        let [...walls] = isWall;
        walls[i][j] = true;

        setWall(walls);
    }

    async function createMazeAndAnimate() {
        setWall(fillMatrix(rows, cols, true));
        setStartNode(undefined);
        setGoalNode(undefined);
        setFinalPath(undefined);

        const [orderCarved, walls] = generateMaze(rows, cols);

        orderCarved.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className = 'node';
            }, i * 8);
        })

        await delay(orderCarved.length * 8);

        setWall(walls);

    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function bfsAnimate() {

        let [traversalOrder, shortestPath] = breadthFirstSearch(
            isWall, startNode, goalNode, rows, cols);

        traversalOrder.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className = 'node traversed';
            }, i * 15);
        })

        await delay(traversalOrder.length * 15);

        traversalOrder.forEach(([y, x], i) => {
            refCollection.current[y][x].current.className = 'node';
        })

        shortestPath?.forEach(([y, x], i) => {
            setTimeout(() => {
                refCollection.current[y][x].current.className = 'node shortest-path';
            }, i * 8);
        })

        refCollection.current[goalNode[0]][goalNode[1]].current.className = 'node goal';
        setFinalPath(shortestPath);

    }

    return (
        <>
            <Toolbar
                generateMaze={createMazeAndAnimate}
                clearGrid={() => {
                    setWall(fillMatrix(rows, cols, false))
                    refCollection.current.forEach(row => {
                        row.forEach(ref => {
                            ref.current.className = 'node';
                        })
                    })
                    setFinalPath(undefined);
                }}
                pickRandomStart={() => pickRandomFreeNode(isWall, setStartNode,
                    refCollection, finalPath)}
                pickRandomEnd={() => pickRandomFreeNode(isWall, setGoalNode,
                    refCollection, finalPath)}
                startBfs={() => (!startNode || !goalNode ?
                    alert('Please Pick a Start and a Goal Node!!') : bfsAnimate())}
            />
            <div
                onMouseDown={() => setIsMouseDown(true)}
                onMouseUp={() => setIsMouseDown(false)}
                className='grid'
            >
                {grid.map((row, i) => <div key={i} className='board-row'>{row}</div>)}
            </div>
        </>
    )
}

export default Grid
