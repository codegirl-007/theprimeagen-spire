#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${TMUX:-}" ]]; then
  printf 'dev_setup.sh must be run inside tmux\n' >&2
  exit 1
fi

tmux rename-window shell
tmux new-window -d -n nvim 'nvim .'
tmux new-window -d -n server 'make server'
