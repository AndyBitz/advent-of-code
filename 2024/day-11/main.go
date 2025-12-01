package main

import (
	"container/list"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

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

func parseInput(input string) *list.List {
	unparsed := strings.Split(input, " ")
	numbers := list.New()
	for _, n := range unparsed {
		parsed, _ := strconv.ParseInt(n, 0, 64)
		numbers.PushBack(int(parsed))
	}
	return numbers
}

func printLine(line *list.List) {
	for e := line.Front(); e != nil; e = e.Next() {
		fmt.Print(e.Value.(int))
		fmt.Print(" ")
	}
	fmt.Print("\n")
}

func countDigits(n int) int {
	if n > 0 {
		return 1 + countDigits(n/10)
	}
	return 0
}

func splitNumber(n int, c int) (int, int) {
	str := fmt.Sprintf("%d", n)
	sLhs, sRhs := str[:c/2], str[c/2:]
	lhs, _ := strconv.ParseInt(sLhs, 10, 64)
	rhs, _ := strconv.ParseInt(sRhs, 10, 64)
	return int(lhs), int(rhs)
}

func countList(line *list.List) int {
	count := 0
	for e := line.Front(); e != nil; e = e.Next() {
		count += 1
	}
	return count
}

func partOne(input string) {
	line := parseInput(input)

	for range 25 {
		for e := line.Front(); e != nil; e = e.Next() {
			val := e.Value.(int)

			if val == 0 {
				e.Value = 1
			} else if c := countDigits(val); c%2 == 0 {
				lhs, rhs := splitNumber(val, c)
				e.Value = lhs
				e = line.InsertAfter(rhs, e)
			} else {
				e.Value = val * 2024
			}
		}
	}

	fmt.Println("Result 1", countList(line))
}

func copyMap(target map[int]int) map[int]int {
	next := make(map[int]int)
	for key, value := range target {
		next[key] = value
	}
	return next
}

func partTwo(input string) {
	line := parseInput(input)

	present := make(map[int]int)
	incValue := func(val int, n int) {
		cur, ok := present[val]
		if ok {
			present[val] = max(0, cur+n)
		} else {
			present[val] = max(0, n)
		}

		if present[val] == 0 {
			delete(present, val)
		}
	}

	for e := line.Front(); e != nil; e = e.Next() {
		val := e.Value.(int)
		incValue(val, 1)
	}

	for range 75 {
		for val, count := range copyMap(present) {
			incValue(val, count*-1)

			if val == 0 {
				incValue(1, count*1)
			} else if c := countDigits(val); c%2 == 0 {
				lhs, rhs := splitNumber(val, c)
				incValue(lhs, count*1)
				incValue(rhs, count*1)
			} else {
				incValue(val*2024, count*1)
			}
		}
	}

	sum := 0
	for _, count := range present {
		sum += count
	}

	fmt.Println("Result 2", sum)
}
