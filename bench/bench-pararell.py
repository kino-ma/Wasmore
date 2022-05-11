# Benchmark script.
# Please start the server with `make` in the root directory before a measurement.

from asyncore import loop
from dataclasses import dataclass
import sys
import datetime
import time
import csv
import concurrent.futures as futures
from concurrent.futures import ThreadPoolExecutor
from typing import List
from urllib.request import Request

import requests

REQUEST_COUNT = 1000
BATCH_COUNT = 10
INTERVAL = 5


@dataclass
class Latency():
    delta: datetime.timedelta
    loop: int
    count: int


def average(values, zero_value=datetime.timedelta(0)):
    return sum(values, zero_value) / len(values)


def show_delta(delta):
    return f"{format_delta(delta): >8} μs"


def format_delta(delta):
    return f"{delta.seconds * 1_000_000 + delta.microseconds}"


def eprint(*args):
    print(*args, file=sys.stderr)


def print_deltas(deltas):
    for d in deltas:
        eprint(show_delta(d))
    eprint("average: ", show_delta(average(deltas)))
    eprint("min:     ", show_delta(min(deltas)))
    eprint("max:     ", show_delta(max(deltas)))


def write_csv(latencies: List[Latency], file):
    data = [{'count': l.count, 'latency': format_delta(
        l.delta), 'loop': l.loop} for l in latencies]
    writer = csv.DictWriter(file, fieldnames=data[0].keys())

    writer.writeheader()
    writer.writerows(data)


def send_request(url, input=None):
    if input:
        # POST
        data = {"input": input}
        eprint(f"request to {url} with {data}")
        return requests.post(url, data)
    else:
        # GET
        eprint(f"request to {url}")
        return requests.get(url)


def request_concurrent(url, input=None, count=10) -> List[requests.Response]:
    inputs = input

    if not isinstance(input, list):
        inputs = [input for _ in range(count)]

    with ThreadPoolExecutor(max_workers=count) as executor:
        reqs = {executor.submit(send_request,
                                url, inputs[i]): i for i in range(count)}

    results: list[Request] = []

    for future in futures.as_completed(reqs):
        result = future.result()
        results.append(result)

    if len(results) < 1:
        raise RuntimeError("No response returned")

    return results


def main(path=None, inp=None):
    base_url = "http://localhost:3000"

    if not path:
        path = "/hello"

    if not path.startswith("/"):
        path = f"/{path}"

    eprint()
    eprint(f" === START BENCHMARK FOR {path} == ")

    # light tasks
    latencies = []

    url = f"{base_url}{path}"
    loop_num = REQUEST_COUNT // BATCH_COUNT
    for loop in range(loop_num):
        time.sleep(INTERVAL)
        responses = request_concurrent(url, inp, BATCH_COUNT)
        for i, response in enumerate(responses):
            elapsed = response.elapsed
            l = Latency(elapsed, loop, i)
            latencies.append(l)

    eprint(f"## {path} ##")
    print_deltas([l.delta for l in latencies])

    write_csv(latencies, sys.stdout)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    inp = sys.argv[2] if len(sys.argv) > 2 else None
    main(path, inp)
