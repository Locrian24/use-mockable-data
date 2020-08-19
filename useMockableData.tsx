import { createContainer, Container } from "unstated-next";

type DataReturnType<T, R> = [(initialState?: T) => R, Container<R, T>];

/**
 * A hook that generalises our wrapper to be able to mock data in storybook
 * to help with future implementations without copying the logic every time
 * @param mainFunction Object containing the gql query and the query variables
 * @param middleware Middleware function to modify initialState/return of the mainFunction before being output by the context. Must take return of the mainFunction as parameters
 */
function useMockableData<T>(mainFunction: () => T): DataReturnType<T, T>
function useMockableData<T, R>(mainFunction: () => T, middleware: (args: T) => R): DataReturnType<T, R>
function useMockableData<T, R = T>(
  mainFunction: () => T,
  middleware?: (args: T) => R
): DataReturnType<T, R | T> {
  function useDataInternal(initialState?: T): T | R {
    if (process.env.NODE_ENV === "test") {
      if (initialState === undefined)
        throw new Error("Context must have an initialState");

      return middleware ? middleware(initialState) : initialState;
    }

    const mainReturn = mainFunction();

    return middleware ? middleware(mainReturn) : mainReturn;
  }

  const Context = createContainer(useDataInternal);

  function useHook(initialState?: T) {
    if (process.env.NODE_ENV === "test") {
      return Context.useContainer();
    }

    return useDataInternal(initialState);
  }

  return [useHook, Context];
}

export default useMockableData;
