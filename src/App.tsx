import { useEffect, useState } from "react";
import styled from "styled-components";
import React from "react";
import { Sudoku, sudokus } from "./sudokus";
import { Readout } from "./Readout";
import GithubCorner from "react-github-corner";

/**
 * Build an array of regions where each region is an array of indices (i.e. [0,0]).
 * This can be used later to get the actual values of the region or to highlight cells.
 */
const buildRegionIndicesIndices = () => {
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

const regionIndices = buildRegionIndicesIndices();

type GroupType = "row" | "column" | "region";
export type Error = {
  type: GroupType;
  index: number;
};

function App() {
  // State for if a row, column, or group is highlighted
  const [highlightedRow, setHighlightedRow] = useState<number | undefined>(
    undefined,
  );
  const [highlightedCol, setHighlightedCol] = useState<number | undefined>(
    undefined,
  );
  const [highlightedRegion, setHighlightedRegion] = useState<
    number | undefined
  >(undefined);

  // State for if an error is found
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // State for the selected sudoku
  const [selectedSudokuIndex, setSelectedSudokuIndex] = useState(0);
  const [sudoku, setSudoku] = useState<Sudoku>(
    sudokus[selectedSudokuIndex].sudoku,
  );

  // When the selectedSudokuIndex is changed, reset all highlighting and load the corresponding puzzle
  useEffect(() => {
    // Reset highlighting
    setError(undefined);
    setIsLoading(true);
    setHighlightedRow(undefined);
    setHighlightedCol(undefined);
    setHighlightedRegion(undefined);

    // Set the sudoku according to index
    setSudoku(sudokus[selectedSudokuIndex].sudoku);
  }, [selectedSudokuIndex]);

  // Fn to decide when a cell is highlighted. Handles rows, cols, and regions
  const cellHighlighted = (i: number, j: number) => {
    return (
      i === highlightedRow ||
      j === highlightedCol ||
      (highlightedRegion !== undefined &&
        regionIndices[highlightedRegion].some((g) => g[0] === i && g[1] === j))
    );
  };

  // Meat and potatoes. Simple Sudoku validation alg plus a little async and signal magic for visualization
  const validateSudoku = async (sudoku: Sudoku, signal: AbortSignal) => {
    const isValid = (group: number[]) => new Set(group).size === 9;
    const transpose = (sudoku: Sudoku) =>
      sudoku[0].map((_, colIndex) => sudoku.map((row) => row[colIndex]));
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const check = async (groups: number[][], type: GroupType) => {
      for (const [i, group] of groups.entries()) {
        if (signal.aborted) {
          break;
        }
        switch (type) {
          case "row":
            setHighlightedRow(i);
            break;
          case "column":
            setHighlightedCol(i);
            break;
          case "region":
            setHighlightedRegion(i);
            break;
          default:
            break;
        }
        await sleep(250);

        if (!isValid(group)) {
          // console.log(`Error in ${type} ${i}`);
          setError({ type, index: i });
          return false;
        }
      }
      return true;
    };

    // Build the regions from the regionIndices array
    const regions = regionIndices.map((region) =>
      region.map((indices) => sudoku[indices[0]][indices[1]]),
    );

    // Assemble a list of groups to check
    const groups: Record<GroupType, number[][]> = {
      row: sudoku,
      column: transpose(sudoku),
      region: regions,
    };

    for (const groupKV of Object.entries(groups)) {
      // Break if any group did not pass
      const passed = await check(groupKV[1], groupKV[0] as GroupType);
      if (!passed) {
        break;
      }

      // After each group is checked, reset highlighting
      setHighlightedRow(undefined);
      setHighlightedCol(undefined);
      setHighlightedRegion(undefined);
    }

    // If this finished organically, we are done loading
    if (!signal.aborted) {
      setIsLoading(false);
    }
  };

  // When a new puzzle is loaded, validate the sudoku after aborting any previous running validation
  React.useEffect(() => {
    const controller = new AbortController();
    validateSudoku(sudoku, controller.signal);
    return () => {
      controller.abort();
    };
  }, [sudoku]);

  return (
    <Main>
      <GithubCorner
        href="https://github.com/Cutaiar/sudoku-checker"
        octoColor="#242424"
        bannerColor="white"
      />
      <div>
        <Title>Visual Sudoku Check</Title>
        <Subtitle>
          Select a sudoku from the list and watch as rows, columns, and regions
          are validated
        </Subtitle>
      </div>
      <Visual>
        <SudokuList>
          {sudokus.map((s, i) => {
            return (
              <SudokuListItem
                $valid={s.valid}
                $selected={i === selectedSudokuIndex}
                onClick={() => setSelectedSudokuIndex(i)}
                key={i}
              >
                {(s.valid ? "✅ " : "❌ ") + s.sudoku[0].join("")}
              </SudokuListItem>
            );
          })}
        </SudokuList>
        <GridWrapper>
          <SudokuGrid>
            {sudoku.map((row, i) => (
              <Row key={i} $error={!!error}>
                {row.map((cell, j) => (
                  <Cell
                    key={j}
                    $highlighted={cellHighlighted(i, j)}
                    $error={!!error}
                  >
                    {cell}
                  </Cell>
                ))}
              </Row>
            ))}
          </SudokuGrid>
          <Readout indeterminate={isLoading} error={error} />
        </GridWrapper>
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
  padding: 8px;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  line-height: 1.1;
  margin: 0;
`;

const Subtitle = styled.p`
  color: grey;
  margin: 0;
  font-size: 1.3rem;
`;

const SudokuGrid = styled.div`
  border: 0.5px solid grey;
  height: fit-content;
`;

const GridWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-family: "Lucida Console", Courier, monospace;
  --color: ${(props) => (props.$valid ? "green" : "red")};
  --border: ${(props) => (props.$selected ? "2px" : "1px")};
  --bg: ${(props) => (props.$selected ? "hsl(0 0% 40%/30%)" : "transparent")};
  background-color: var(--bg);
  border: var(--border) solid grey;
  border-radius: 4px;
  padding: 8px;
  &:hover {
    transform: scale(1.1);
  }
  transition: transform 100ms linear;
`;

const Cell = styled.span<{ $highlighted?: boolean; $error?: boolean }>`
  font-family: "Lucida Console", Courier, monospace;
  --color: ${(props) => (props.$error ? "red" : "green")};
  width: 1.5rem;
  border: 0.5px solid grey;
  background-color: ${(props) =>
    props.$highlighted ? "var(--color)" : "transparent"};
  text-align: center;
  transition: background-color 200ms linear;
`;

const Row = styled.div<{ $highlighted?: boolean; $error?: boolean }>`
  --color: ${(props) => (props.$error ? "red" : "green")};
  display: flex;
  flex-direction: row;
  background-color: ${(props) =>
    props.$highlighted ? "var(--color)" : "transparent"};
`;
