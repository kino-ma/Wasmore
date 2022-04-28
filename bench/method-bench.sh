#!/bin/bash

set -euxo pipefail

usage_exit() {
    set +x
    echo "./method-bench.sh <NAME> [OUT_DIR]"
    exit 1
}

out_dir=${1:-result}
mkdir -p $out_dir

run() {
    export RUN_METHOD="${1}"

    (
        cd ..
        make
    ) &
    server_proc=$!

    sleep 10

    # # LIGHT
    # task=light
    # input=92
    # path="/$task-task"
    # python3 bench.py "$path" "$input" > "$out_dir/$RUN_METHOD-$task.csv"

    # # HEAVY
    # task=heavy
    # input=50000000
    # path="/$task-task"
    # python3 bench.py "$path" "$input" > "$out_dir/$RUN_METHOD-$task.csv"

    # # MANY LIGHT
    # task=light
    # living_containers="$out_dir/$RUN_METHOD-$task-living-containers.csv"
    # echo "count,time,living-containers" > "$living_containers"
    # input=92
    # path="/$task-tasks/1"

    # echo
    # echo
    # echo "start many $task"
    # echo

    # for count in {1..100}
    # do
    #     echo
    #     echo "-- many #$count --"
    #     echo

    #     python3 bench.py "$path" "$input" > "$out_dir/$RUN_METHOD-$task-$input-$count.csv"

    #     time="$(date +%R:%S)"
    #     # grep exists with 0 if none matched
    #     containers="$(docker ps | grep -v 'CONTAINER ID' | wc -l || true)"
    #     /bin/echo "number of containers: #$count ($time): $containers"
    #     echo "$count,$time,$containers" >> $living_containers
    #     echo
        
    #     sleep 5m
    # done

    # MANY HEAVY
    task=heavy
    living_containers="$out_dir/$RUN_METHOD-$task-living-containers.csv"
    echo "count,time,living-containers" > "$living_containers"

    echo
    echo
    echo "start many heavy"
    echo

    for count in {1..100}
    do
        echo
        echo "-- many #$count --"
        echo

        # for i in {2..7}
        # do
        #     path="/$task-tasks/$i"
        #     python3 bench.py "$path" "$input" > "$out_dir/$RUN_METHOD-$task-$input-$count.csv"
        #     input+=0
        #     sleep 1
        # done

        input=50000000
        path="/$task-tasks/1"
        python3 bench.py "$path" "$input" > "$out_dir/$RUN_METHOD-$task-$input-$count.csv"
        time="$(date +%R:%S)"
        # grep exists with 0 if none matched
        containers="$(docker ps | grep -v 'CONTAINER ID' | wc -l || true)"
        /bin/echo "number of containers: #$count ($time): $containers"
        echo "$count,$time,$containers" >> $living_containers
        echo

        sleep 5m
    done

    # kill all node children
    ps ax -o pid=,command | grep node | grep -vE 'vscode|grep' | awk '{print $1}' | xargs kill
}

for method in "proposed" "wasm" "container"
do
    time="$(date +%F_%R:%S)"
    log_file="./log/${method}_${time}.log"

    ( cd .. && make clean-container )

    run "$method" | tee "$log_file"

    sleep 10
done