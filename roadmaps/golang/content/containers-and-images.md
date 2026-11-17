# Containers and images

A Go service ships best as a static binary inside a minimal runtime image. Multi-stage builds keep the compiler out of the final layer, and pinning the base image makes the artifact reproducible.

Visit the following resources to learn more:

- [@docs@Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [@docs@Distroless images](https://github.com/GoogleContainerTools/distroless)
