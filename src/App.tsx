import { useEffect, useState } from "react";
import styled from "styled-components";
import React from "react";
import { Sudoku, sudokus } from "./sudokus";

/**
 * Build an array of groups where each group is an array of indices (i.e. [0,0]).
 */
const buildGroupIndices = () => {
  const groups: number[][][] = [];
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      const group: number[][] = [];
      for (let k = i; k < i + 3; k++) {
        for (let l = j; l < j + 3; l++) {
          group.push([k, l]);
        }
      }
      groups.push(group);
    }
  }
  return groups;
};

const groups = buildGroupIndices();

type GroupType = "row" | "col" | "region";

function App() {
  const [highlightedRow, setHighlightedRow] = useState<number | undefined>(
    undefined,
  );
  const [highlightedCol, setHighlightedCol] = useState<number | undefined>(
    undefined,
  );

  const [highlightedRegion, setHighlightedRegion] = useState<
    number | undefined
  >(undefined);

  const [hasError, setHasError] = useState(false);

  const [idx, setIdx] = useState(0);
  const [sudoku, setSudoku] = useState<Sudoku>(sudokus[idx].sudoku);
  useEffect(() => {
    setHasError(false);
    setHighlightedRow(undefined);
    setHighlightedCol(undefined);
    setHighlightedRegion(undefined);
    setSudoku(sudokus[idx].sudoku);
  }, [idx]);

  const rowHighlighted = (i: number) => {
    return i === highlightedRow;
  };

  const cellHighlighted = (i: number, j: number) => {
    return (
      j === highlightedCol ||
      (highlightedRegion !== undefined &&
        groups[highlightedRegion].some((g) => g[0] === i && g[1] === j))
    );
  };

  const validateSudoku = async (sudoku: Sudoku, signal: AbortSignal) => {
    const isValid = (group: number[]) => {
      const set = new Set(group);
      return set.size === 9;
    };
    const transpose = (sudoku: Sudoku) =>
      sudoku[0].map((_, colIndex) => sudoku.map((row) => row[colIndex]));

    const check = async (groups: number[][], type: GroupType) => {
      for (const [i, group] of groups.entries()) {
        if (signal.aborted) {
          break;
        }
        switch (type) {
          case "row":
            setHighlightedRow(i);
            break;
          case "col":
            setHighlightedCol(i);
            break;
          case "region":
            setHighlightedRegion(i);
            break;
          default:
            break;
        }
        await sleep(300);

        if (!isValid(group)) {
          console.log(`Error in ${type} ${i}`);
          setHasError(true);
          return false;
        }
      }
      return true;
    };

    const regions = groups.map((gi) =>
      gi.map((indices) => sudoku[indices[0]][indices[1]]),
    );
    const toCheck: Record<GroupType, number[][]> = {
      row: sudoku,
      col: transpose(sudoku),
      region: regions,
    };
    for (const groupkv of Object.entries(toCheck)) {
      const passed = await check(groupkv[1], groupkv[0] as GroupType);
      if (!passed) {
        break;
      }
      setHighlightedRow(undefined);
      setHighlightedCol(undefined);
      setHighlightedRegion(undefined);
    }
  };

  React.useEffect(() => {
    const controller = new AbortController();
    validateSudoku(sudoku, controller.signal);
    return () => {
      controller.abort();
    };
  }, [sudoku]);

  return (
    <Main>
      <div>
        <Title>Visual Sudoku Checker</Title>
        <Subtitle>
          Select a sudoku on the left and watch as its rows, columns, and
          regions are checked
        </Subtitle>
      </div>
      <Visual>
        <SudokuList>
          {sudokus.map((s, i) => {
            return (
              <SudokuListItem
                $valid={s.valid}
                $selected={i === idx}
                onClick={() => setIdx(i)}
                key={i}
              >
                {(s.valid ? "✅ " : "❌ ") + s.sudoku[0].join("")}
              </SudokuListItem>
            );
          })}
        </SudokuList>
        <div>
          {sudoku.map((row, i) => (
            <Row key={i} $highlighted={rowHighlighted(i)} $error={hasError}>
              {row.map((cell, j) => (
                <Cell
                  key={j}
                  $highlighted={cellHighlighted(i, j)}
                  $error={hasError}
                >
                  {cell}
                </Cell>
              ))}
            </Row>
          ))}
        </div>
      </Visual>
    </Main>
  );
}

export default App;

const Visual = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SudokuList = styled.ol`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SudokuListItem = styled.li<{ $valid: boolean; $selected?: boolean }>`
  --color: ${(props) => (props.$valid ? "green" : "red")};
  --border: ${(props) => (props.$selected ? "3px" : "1px")};
  border: var(--border) solid grey;
  border-radius: 4px;
  padding: 8px;
  &:hover {
    transform: scale(1.1);
  }
  transition: transform;
`;

const Cell = styled.span<{ $highlighted?: boolean; $error?: boolean }>`
  --color: ${(props) => (props.$error ? "red" : "green")};
  width: 1.5rem;
  border: 1px solid grey;
  background-color: ${(props) =>
    props.$highlighted ? "var(--color)" : "transparent"};
  text-align: center;
`;

const Row = styled.div<{ $highlighted?: boolean; $error?: boolean }>`
  --color: ${(props) => (props.$error ? "red" : "green")};
  display: flex;
  flex-direction: row;
  background-color: ${(props) =>
    props.$highlighted ? "var(--color)" : "transparent"};
`;

const Title = styled.h1`
  font-size: 3.2rem;
  line-height: 1.1;
  margin: 0;
`;

const Subtitle = styled.p`
  color: grey;
  margin: 0;
  margin-bottom: 32px;
  font-size: 1.5rem;
`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
