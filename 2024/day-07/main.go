package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Equation struct {
	result int
	values []int
}

func main() {
	wordPtr := flag.String("file", "./test.txt", "input file")
	flag.Parse()

	raw, fileErr := os.ReadFile(*wordPtr)
	if fileErr != nil {
		fmt.Println(fileErr)
		os.Exit(1)
	}

	partOne(string(raw))
	partTwo(string(raw))
}

func parseInput(input string) []Equation {
	list := make([]Equation, 0)

	for _, row := range strings.Split(input, "\n") {
		result := 0
		values := make([]int, 0)

		for i, val := range strings.Split(row, " ") {
			if i == 0 {
				parsed, _ := strconv.ParseInt(val[:len(val)-1], 0, 64)
				result = int(parsed)
				continue
			}

			parsed, _ := strconv.ParseInt(val, 0, 64)
			values = append(values, int(parsed))
		}

		list = append(list, Equation{result, values})
	}

	return list
}

func joinInts(a, b int) int {
	next, _ := strconv.ParseInt(fmt.Sprintf("%d%d", a, b), 0, 64)
	return int(next)
}

func partOne(input string) {
	list := parseInput(input)
	sum := 0

	for _, eq := range list {
		combs := make([]int, 1)
		combs[0] = eq.values[0]

	out:
		for i, val := range eq.values[1:] {
			nextCombs := make([]int, 0)

			for _, comb := range combs {
				if comb > eq.result {
					continue
				}

				nextProd := comb * val
				nextSum := comb + val

				if i == len(eq.values)-2 {
					if nextProd == eq.result || nextSum == eq.result {
						sum += eq.result
						break out
					}
				}

				nextCombs = append(nextCombs, nextProd)
				nextCombs = append(nextCombs, nextSum)
			}

			combs = nextCombs
		}
	}

	fmt.Println("Result 1:", sum)
}

func partTwo(input string) {
	list := parseInput(input)
	sum := 0

	for _, eq := range list {
		combs := make([]int, 1)
		combs[0] = eq.values[0]

	out:
		for i, val := range eq.values[1:] {
			nextCombs := make([]int, 0)

			for _, comb := range combs {
				if comb > eq.result {
					continue
				}

				nextProd := comb * val
				nextSum := comb + val
				nextConc := joinInts(comb, val)

				if i == len(eq.values)-2 {
					if nextProd == eq.result || nextSum == eq.result || nextConc == eq.result {
						sum += eq.result
						break out
					}
				}

				nextCombs = append(nextCombs, nextProd)
				nextCombs = append(nextCombs, nextSum)
				nextCombs = append(nextCombs, nextConc)
			}

			combs = nextCombs
		}
	}

	fmt.Println("Result 2:", sum)
}
