# Fuzzing

Go's fuzzing engine extends the test binary with coverage-guided random inputs. Seeds come from `f.Add`, failures are minimized to a file you commit, and the generated corpus stays out of source control.

Visit the following resources to learn more:

- [@docs@Go fuzzing documentation](https://go.dev/doc/security/fuzz/)
- [@docs@Tutorial: Fuzzing with Go](https://go.dev/doc/tutorial/fuzz)
- [@docs@testing package — fuzzing](https://pkg.go.dev/testing#hdr-Fuzzing)
