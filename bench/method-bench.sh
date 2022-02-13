#!/bin/bash

set -euxo pipefail

usage_exit() {
    echo "./method-bench.sh <NAME> [OUT_DIR]"
    exit 1
}

name=${1}
out_dir=${2:-.}

if [[ -z "$name" ]]
then
    echo "please specify name" >&2
    usage_exit
fi

for task in "light" "heavy"
do
    path="/$task-task"
    python3 bench.py "$path" > "$out_dir/$name-$task.csv"
done