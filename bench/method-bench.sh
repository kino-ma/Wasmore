#!/bin/bash

set -euxo pipefail

usage_exit() {
    set +x
    echo "./method-bench.sh <NAME> [OUT_DIR]"
    exit 1
}

name=${1:-}
out_dir=${2:-.}

if [[ -z "$name" ]]
then
    echo "please specify name" >&2
    usage_exit
fi

# LIGHT
task=light
input=92
path="/$task-task"
python3 bench.py "$path" "$input" > "$out_dir/$name-$task.csv"

# HEAVY
task=heavy
input=50000000
path="/$task-task"
python3 bench.py "$path" "$input" > "$out_dir/$name-$task.csv"