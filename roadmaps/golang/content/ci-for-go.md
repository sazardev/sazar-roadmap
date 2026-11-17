# CI for Go

CI for Go is mostly configuration discipline: derive the toolchain version from the module, cache downloads, and run every package with the race detector. Extra checks belong only when a human owns their output.

Visit the following resources to learn more:

- [@docs@Building and testing Go with Actions](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-go)
- [@docs@actions/setup-go](https://github.com/actions/setup-go)
