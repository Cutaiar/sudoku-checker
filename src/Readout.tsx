import styled from "styled-components";
import { type Error } from "./App";

export const Readout = (props: { indeterminate?: boolean; error?: Error }) => {
  const { indeterminate, error } = props;
  const { type, index } = error ?? {};
  const content: Record<State, string> = {
    error: `${type} ${index} is invalid`,
    success: "The sudoku is valid",
    loading: "Checking...",
  };
  const state = indeterminate ? "loading" : error ? "error" : "success";
  return <Content $state={state}>{content[state]}</Content>;
};

type State = "error" | "success" | "loading";
const colors: Record<State, string | undefined> = {
  error: "red",
  success: "green",
  loading: undefined,
};

const Content = styled.span<{ $state: State }>`
  font-family: "Lucida Console", Courier, monospace;
  color: ${(props) => colors[props.$state]};
  &::first-letter {
    text-transform: capitalize;
  }
  background-color: hsl(0, 0%, 10%);
  padding: 8px;
  border-radius: 4px;
  line-height: 1rem;
`;
