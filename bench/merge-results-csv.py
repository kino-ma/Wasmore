import csv
from dataclasses import dataclass, field
import sys
from typing import List, TypedDict

Record = TypedDict('Record', {'count': int, 'latency': int})


@dataclass
class Measurement():
    name: str
    task: str
    inp: int
    loopN: int

    def filename(self):
        return f"result/{self.name}-{self.task}-{self.inp}-{self.loopN}.csv"

    def read_csv(self, file):
        # fields: ["count", "latency"]
        reader = csv.DictReader(file)
        records = []
        for record in reader:
            records.append(record)
        return records

    def merge_record(self, records: List[Record]):
        return MergedRecords(records, self.name,  self.task, self.inp, self.loopN)


class MergedRecords():
    fieldnames: List[str] = ["name", "task",
                             "input", "loop-number", "count", "time"]
    records: List[Record]

    def __init__(self, records: List[Record], name, task, inp, loopN):
        self.records = [{'name': name, 'task': task, 'input': inp, 'loop-number': loopN,
                         'count': record['count'], 'time': record['latency']} for record in records]

    def print_records(self, out_file=sys.stdout, write_header=False):
        writer = csv.DictWriter(out_file, fieldnames=self.fieldnames)

        if write_header:
            writer.writeheader()

        writer.writerows(self.records)


def merge(name, task, inp, loopN, is_first=False):
    measuerment = Measurement(name, task, inp, loopN)

    file = measuerment.filename()
    records = None
    with open(file, 'r') as f:
        records = measuerment.read_csv(f)
    merged = measuerment.merge_record(records)
    merged.print_records(out_file=sys.stdout, write_header=is_first)


def main(name, task, inp):
    is_first = True
    for loopN in range(1, 100+1):
        merge(name, task, inp, loopN, is_first=is_first)
        is_first = False


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(f"usage: {sys.argv[0]} <METHOD_NAME> <TASK> [INPUT]")
        exit(1)

    name = sys.argv[1]
    task = sys.argv[2]

    print(name, task, file=sys.stderr)

    if len(sys.argv) > 3:
        inp = sys.argv[3]
    else:
        inp = 92 if "light" in task else 50000000

    main(name, task, inp)
