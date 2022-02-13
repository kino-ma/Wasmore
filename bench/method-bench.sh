#!/bin/bash

set -euxo pipefail

usage_exit() {
    set +x
    echo "./method-bench.sh <NAME> [OUT_DIR]"
    exit 1
}

name=${1:-}
out_dir=${2:-.}
mkdir -p $out_dir

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

# MANY HEAVY
task=heavy
living_containers="$out_dir/$name-$task-living-containers.csv"
echo "count,time,living-containers" > "$living_containers"
# clean containers before counting many containers
( cd .. && make clean-container )

echo
echo
echo "start many"
echo

for count in {1..10}
do
    input=500

    echo
    echo "-- many #$count --"
    echo

    for i in {2..7}
    do
        path="/$task-tasks/$i"
        python3 bench.py "$path" "$input" > "$out_dir/$name-$task-$input-$count.csv"
        input+=0
        sleep 1
    done

    /bin/echo -n "number of containers:"
    time="$(date +%R:%S)"
    containers="$(docker ps | grep -v "CONTAINER ID" | wc -l)"
    /bin/echo "#$count ($time): $containers"
    echo "$count,$time,$containers" >> $living_containers
    echo
    
    sleep 5m
done