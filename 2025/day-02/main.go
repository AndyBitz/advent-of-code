package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

func partOne(path string) {
	buf, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	sum := 0
	data := strings.Trim(string(buf), "\n")

	for raw := range strings.SplitSeq(data, ",") {
		pair := strings.Split(raw, "-")

		lower, err := strconv.Atoi(pair[0])
		if err != nil {
			panic(err)
		}

		upper, err := strconv.Atoi(pair[1])
		if err != nil {
			panic(err)
		}

		for i := lower; i <= upper; i++ {
			str := fmt.Sprintf("%d", i)
			lhs := str[:len(str)/2]
			rhs := str[len(str)/2:]
			if rhs == lhs {
				sum += i
			}
		}
	}

	fmt.Printf("Result: %d\n", sum)
}

func partTwo(path string) {
	buf, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	sum := 0
	data := strings.Trim(string(buf), "\n")

	for raw := range strings.SplitSeq(data, ",") {
		pair := strings.Split(raw, "-")

		lower, err := strconv.Atoi(pair[0])
		if err != nil {
			panic(err)
		}

		upper, err := strconv.Atoi(pair[1])
		if err != nil {
			panic(err)
		}

		for i := lower; i <= upper; i++ {
			str := fmt.Sprintf("%d", i)

		out:
			for j := range len(str) {
				if j == 0 {
					continue
				}

				if len(str)%j != 0 {
					continue
				}

				seq := str[0:j]
				matches := true

				for k := j; k < len(str); k += j {
					if seq != str[k:k+j] {
						matches = false
						break
					}
				}

				if matches {
					sum += i
					break out
				}
			}
		}
	}

	fmt.Printf("Result: %d\n", sum)
}

func main() {
	path := "./input-1.txt"
	partOne(path)
	partTwo(path)
}
