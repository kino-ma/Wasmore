import csv
from statistics import mean
import sys


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

    def diff_first(self):
        first = self.first()
        rest = self.rest()
        rest_mean = mean(rest)
        return first / rest_mean - 1.0


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

    def diff_mean(self):
        avgs = []

        for loop in self.loops:
            avg = loop.diff_first()
            avgs.append(avg)

        return mean(avgs)

    def as_dict(self):
        return {
            "name": self.name,
            "task": self.task,
            "input": self.inp,
            "mean-diff": self.diff_mean(),
        }


class Method():
    def __init__(self, name, taskname):
        self.name = name
        self.taskname = taskname
        self.tasks: list[Task] = []

        for inp in [5 * 10 ** n for n in range(2, 7+1)]:
            task = Task(self.name, self.taskname, inp)
            self.tasks.append(task)

    def avg_loop_diffs(self):
        means = [task.diff_mean() for task in self.tasks]
        return mean(means)

    def as_dict_list(self):
        return [task.as_dict() for task in self.tasks]


def main(out_file):
    records = []

    for name in ["proposed", "wasm", "container"]:
        for taskname in ["heavy"]:
            method = Method(name, taskname)
            records += method.as_dict_list()

    writer = csv.DictWriter(out_file, fieldnames=[
                            "name", "task", "input", "mean-diff"])

    writer.writeheader()
    writer.writerows(records)


if __name__ == "__main__":
    f = sys.stdout

    if len(sys.argv) >= 2:
        f = open(sys.argv[1], 'w')

    main(f)
