import csv
from http.client import REQUEST_TIMEOUT
from statistics import mean
import sys


METRICS1 = "min-coldstart"
METRICS2 = "min-latency"
METRICS3A = "max-min-coldstart"
METRICS3B = "max-min-latency"

FIELDS = ["name", "task", "input",
          METRICS1, METRICS2, METRICS3A, METRICS3B]


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

    def as_dict(self):
        return {
            "name": self.name,
            "task": self.task,
            "input": self.inp,
            METRICS1: self.loops[0].diff_first(),
            METRICS2: self.loops[0].min_latency(),
            METRICS3A: self.max_min_diff(),
            METRICS3B: self.max_min_latency(),
        }


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
        return [task.as_dict() for task in self.tasks]


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

    writer = csv.DictWriter(out_file, fieldnames=FIELDS)

    writer.writeheader()
    writer.writerows(records)


if __name__ == "__main__":
    f = sys.stdout

    if len(sys.argv) >= 2:
        f = open(sys.argv[1], 'w')

    main(f)
