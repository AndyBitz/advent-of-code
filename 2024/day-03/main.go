package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
)

func main() {
	wordPtr := flag.String("file", "./input-02.txt", "input file")
	flag.Parse()

	raw, fileErr := os.ReadFile(*wordPtr)
	if fileErr != nil {
		fmt.Println(fileErr)
		os.Exit(1)
	}

	partOne(string(raw))
	partTwo(string(raw))
}

func partOne(mem string) {
	var sum int64 = 0

	for i := 0; i < len(mem); i++ {
		if len(mem) < i+4 || mem[i:i+4] != "mul(" {
			continue
		}

		j := i + 4
		done := false

		lhs := ""
		rhs := ""
		current := &lhs

		for {
			next := mem[j]

			if next == ')' {
				done = true
				break
			}

			if next == ',' {
				current = &rhs
				j += 1
				continue
			}

			_, err := strconv.ParseInt(string(next), 0, 64)
			if err != nil {
				break
			}

			*current += string(next)
			j += 1
		}

		if !done {
			continue
		}

		left, _ := strconv.ParseInt(lhs, 0, 64)
		right, _ := strconv.ParseInt(rhs, 0, 64)

		sum += left * right
		i = j
	}

	fmt.Println("Result:", sum)
}

func partTwo(mem string) {
	var sum int64 = 0
	enabled := true

	for i := 0; i < len(mem); i++ {
		if len(mem) > i+4 && mem[i:i+4] == "do()" {
			enabled = true
			continue
		}

		if len(mem) > i+7 && mem[i:i+7] == "don't()" {
			enabled = false
			continue
		}

		if !enabled {
			continue
		}

		if len(mem) > i+2 && mem[i:i+3] != "mul" {
			continue
		}

		if len(mem) > i+3 && mem[i+3] != '(' {
			continue
		}

		j := i + 4
		done := false

		lhs := ""
		rhs := ""
		current := &lhs

		for {
			if len(mem) < j {
				break
			}

			next := mem[j]

			if next == ')' {
				done = true
				break
			}

			if next == ',' {
				current = &rhs
				j += 1
				continue
			}

			_, err := strconv.ParseInt(string(next), 0, 64)
			if err != nil {
				break
			}

			*current += string(next)
			j += 1
		}

		if !done {
			continue
		}

		left, _ := strconv.ParseInt(lhs, 0, 64)
		right, _ := strconv.ParseInt(rhs, 0, 64)

		sum += left * right
		i = j
	}

	fmt.Println("Result:", sum)
}
