# Benchmark script.
# Please start the server with `make` in the root directory before a measurement.

import sys
import datetime
import time
import csv

import requests

REQUEST_COUNT = 10
INTERVAL = 1


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


def write_csv(latencies, file):
    data = [{'count': i, 'latency': format_delta(
        l)} for i, l in enumerate(latencies, start=1)]
    writer = csv.DictWriter(file, fieldnames=data[0].keys())

    writer.writeheader()
    for row in data:
        writer.writerow(row)


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


def main(path=None, inp=None):
    base_url = "http://localhost:3000"

    if not path:
        path = "/hello"

    if not path.startswith("/"):
        path = f"/{path}"

    eprint()
    eprint(f" === START BENCHMARK FOR {path} == ")

    # calculate average latency using `/` (root)
    url = f"{base_url}/"
    latencies = []
    for _ in range(5):
        time.sleep(0.1)
        resp = send_request(url)
        latencies.append(resp.elapsed)

    base_latency = average(latencies)
    eprint("base latency:", base_latency.microseconds)

    time.sleep(1)

    # light tasks
    latencies = []

    url = f"{base_url}{path}"
    for i in range(REQUEST_COUNT):
        time.sleep(INTERVAL)
        response = send_request(url, inp)
        elapsedMs = response.json()["elapsed"]
        elapsed = datetime.timedelta(milliseconds=elapsedMs)
        latencies.append(elapsed)

    eprint(f"## {path} ##")
    print_deltas(latencies)

    write_csv(latencies, sys.stdout)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    inp = sys.argv[2] if len(sys.argv) > 2 else None
    main(path, inp)
