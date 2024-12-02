package main

import (
	"flag"
	"fmt"
	"os"
	"slices"
	"strconv"
	"strings"
)

func main() {
	wordPtr := flag.String("file", "./input-0.txt", "input file")
	flag.Parse()

	raw, fileErr := os.ReadFile(*wordPtr)
	if fileErr != nil {
		fmt.Println(fileErr)
		os.Exit(1)
	}

	partOne(string(raw))
	partTwo(string(raw))
}

func partOne(input string) {
	lines := strings.Split(input, "\n")

	count := 0

	for i := range lines {
		levels := strings.Split(lines[i], " ")

		first, _ := strconv.ParseInt(levels[0], 0, 64)
		last, _ := strconv.ParseInt(levels[len(levels)-1], 0, 64)

		if first > last {
			slices.Reverse(levels)
		}

		prev, _ := strconv.ParseInt(levels[0], 0, 64)
		isSafe := true

		for j := range len(levels) - 1 {
			next, _ := strconv.ParseInt(levels[j+1], 0, 64)
			diff := next - prev

			if !(diff >= 1 && diff <= 3) {
				isSafe = false
				break
			}

			prev = next
		}

		if isSafe {
			count += 1
		}
	}

	fmt.Println("Result:", count)
}

func partTwo(input string) {
	lines := strings.Split(input, "\n")

	count := 0

	for i := range lines {
		levelsRaw := strings.Split(lines[i], " ")
		levels := make([]int64, len(levelsRaw))
		for i := range levelsRaw {
			levels[i], _ = strconv.ParseInt(levelsRaw[i], 0, 64)
		}

		for j := range len(levels) {
			check, _ := checkWithIgnore(levels, j)
			if check {
				count += 1
				break
			}
		}
	}

	fmt.Println("Result:", count)
}

func checkWithIgnore(levels []int64, ignore int) (bool, int) {
	first := true
	second := true
	direction := "asc"
	prev := levels[0]

	for i := range levels {
		next := levels[i]

		if i == ignore {
			continue
		}

		if first {
			first = false
			prev = next
			continue
		}

		if second {
			second = false
			if prev > next {
				direction = "desc"
			} else {
				direction = "asc"
			}
		}

		var diff int64 = 0
		if direction == "asc" {
			diff = next - prev
		} else {
			diff = prev - next
		}

		if !(diff >= 1 && diff <= 3) {
			return false, i
		}

		prev = next
	}

	return true, -1
}
