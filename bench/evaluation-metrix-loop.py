import csv
from http.client import REQUEST_TIMEOUT
from statistics import mean
import sys

WASM_LIGHT = "wasm-light"
WASM_HEAVY = "wasm-heavy"
CONT_LIGHT = "container-light"
CONT_HEAVY = "container-heavy"
PROP_LIGHT = "proposed-light"
PROP_HEAVY = "proposed-heavy"
FIELDS = ["loop-number"] + [f"{task}-{metrics}" for task in [WASM_LIGHT, CONT_LIGHT,
                                                             PROP_LIGHT, WASM_HEAVY, CONT_HEAVY, PROP_HEAVY] for metrics in ["diff", "min-latency"]]


class Loop():
    def __init__(self, name, task, inp, loop_number):
        self.name = name
        self.task = task
        self.inp = inp
        self.loop_number = loop_number
        self.records = []
        self.latencies = []

    def filename(self):
        return f"result/{self.name}-{self.task}-{self.inp}-{self.loop_number}.csv"

    def read_csv(self, file):
        # fields: ["count", "latency"]
        reader = csv.DictReader(file)
        records = []

        for record in reader:
            records.append(record)
            latency = int(record["latency"])
            self.latencies.append(latency)

        self.records = records
        return records

    def first(self):
        return self.latencies[0]

    def rest(self):
        return self.latencies[1:]

    def diff_first(self) -> float:
        first = self.first()
        rest = self.rest()
        rest_mean = mean(rest)
        return first / rest_mean - 1.0

    def min_latency(self):
        return min(self.latencies)


class Task():
    def __init__(self, name, task, inp, loop_range=range(1, 10+1)):
        self.name = name
        self.task = task
        self.inp = inp
        self.loops: list[Loop] = []

        for n in loop_range:
            loop = Loop(self.name, self.task, self.inp, n)
            filename = loop.filename()
            with open(filename, 'r') as f:
                loop.read_csv(f)

            self.loops.append(loop)

    def append_loop(self, loop):
        self.loops.append(loop)

    def max_min_diff(self):
        min_diffs = [loop.diff_first() for loop in self.loops]
        return max(min_diffs)

    def max_min_latency(self):
        min_latencies = [loop.min_latency() for loop in self.loops]
        return max(min_latencies)

    def as_dict_list(self):
        return [{"loop-number": loop.loop_number, f"{self.name}-{self.task}-diff": loop.diff_first(),
                 f"{self.name}-{self.task}-min-latency": loop.min_latency()} for loop in self.loops]


class Method():
    def __init__(self, name, taskname, inputs):
        self.name = name
        self.taskname = taskname
        self.tasks: list[Task] = []

        for inp in inputs:
            task = Task(self.name, self.taskname, inp)
            self.tasks.append(task)

    def avg_loop_diffs(self):
        means = [task.diff() for task in self.tasks]
        return mean(means)

    def as_dict_list(self):
        return sum([task.as_dict_list() for task in self.tasks], start=[])


def main(out_file):
    records = []
    proposed, wasm, container = ["proposed", "wasm", "container"]
    methods = [proposed, wasm, container]

    light_inputs = [92]
    heavy_inputs = [5 * 10 ** n for n in range(2, 7+1)]

    for name in methods:
        for taskname, inputs in zip(["light", "heavy"], [light_inputs, heavy_inputs]):
            method = Method(name, taskname, inputs)
            records += method.as_dict_list()

    rows = [{"loop-number": i} for i in range(1, 10+1)]

    for record in records:
        n = record["loop-number"]
        rows[n-1].update(record)

    writer = csv.DictWriter(out_file, fieldnames=FIELDS)

    writer.writeheader()
    writer.writerows(rows)
    # print(records)


if __name__ == "__main__":
    f = sys.stdout

    if len(sys.argv) >= 2:
        f = open(sys.argv[1], 'w')

    main(f)
