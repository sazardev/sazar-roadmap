# Database migrations

Tools such as goose and golang-migrate apply ordered SQL files and record which versions ran. Safe production changes separate additive expansion from later contraction so old and new code can coexist during a rollout.

Visit the following resources to learn more:

- [@docs@golang-migrate](https://github.com/golang-migrate/migrate)
