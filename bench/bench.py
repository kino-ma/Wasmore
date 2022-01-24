# Benchmark script.
# Please start the server with `make` in the root directory before a measurement.

import sys
import datetime
import time

import requests

REQUEST_COUNT = 10
INTERVAL = 1

def average(values, zero_value=datetime.timedelta(0)):
    return sum(values, zero_value) / len(values)

def show_delta(delta):
    return f"{delta.seconds * 1_000_000 + delta.microseconds: >8} μs"

def print_deltas(deltas):
    for d in deltas:
        print(show_delta(d))
    print("average: ", show_delta(average(deltas)))
    print("min:     ", show_delta(min(deltas)))
    print("max:     ", show_delta(max(deltas)))


def send_request(url, input=None):
    if input:
        # POST
        data = {"input": input}
        print(f"request to {url} with {data}")
        return requests.post(url, data)
    else:
        # GET
        print(f"request to {url}")
        return requests.get(url)

def main():
    base_url = "http://localhost:3000"

    # calculate average latency using `/` (root)
    url = f"{base_url}/"
    latencies = []
    for _ in range(5):
        time.sleep(0.1)
        resp = send_request(url)
        latencies.append(resp.elapsed)

    base_latency = average(latencies)
    print("base latency:", base_latency.microseconds)

    time.sleep(1)

    # light tasks
    light_latencies = []

    url = f"{base_url}/light-task"
    for i in range (REQUEST_COUNT):
        time.sleep(INTERVAL)
        response = send_request(url, 92)
        elapsed = response.elapsed - base_latency
        light_latencies.append(elapsed)

    time.sleep(1)

    # heavy tasks
    heavy_latencies = []

    url = f"{base_url}/heavy-task"
    for i in range (REQUEST_COUNT):
        time.sleep(INTERVAL)
        response = send_request(url, 50_000_000)
        elapsed = response.elapsed - base_latency
        heavy_latencies.append(elapsed)

    print()
    print("## light ##")
    print_deltas(light_latencies)

    print()
    print("## heavy ##")
    print_deltas(heavy_latencies)


if __name__ == "__main__":
    main()