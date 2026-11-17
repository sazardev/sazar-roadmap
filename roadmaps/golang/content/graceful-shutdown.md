# Graceful Shutdown

Graceful shutdown stops accepting new work, drains requests already in flight and exits before the orchestrator kills the process. `http.Server.Shutdown`, signal handling and a deadline make that handover predictable.

Visit the following resources to learn more:

- [@docs@http.Server.Shutdown documentation](https://pkg.go.dev/net/http#Server.Shutdown)
- [@docs@os/signal documentation](https://pkg.go.dev/os/signal)
