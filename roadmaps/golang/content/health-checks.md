# Health Checks

Health endpoints answer orchestrator questions, not user questions. Liveness decides whether to restart, readiness decides whether to route traffic, and startup protects slow initializations. Coupling them makes outages worse.

Visit the following resources to learn more:

- [@docs@Kubernetes probe documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [@docs@net/http documentation](https://pkg.go.dev/net/http)
