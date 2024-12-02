package main

import (
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

func main() {
	raw, _ := os.ReadFile("./input-1.txt")
	lines := strings.Split(string(raw), "\n")

	left := make([]int, len(lines))
	right := make([]int, len(lines))

	for i := range lines {
		result := strings.Split(lines[i], "   ")

		leftValue, _ := strconv.ParseInt(result[0], 0, 64)
		rightValue, _ := strconv.ParseInt(result[1], 0, 64)

		left[i] = int(leftValue)
		right[i] = int(rightValue)
	}

	sort.Ints(left)
	sort.Ints(right)

	// --- Part 1 ---
	sum := 0

	for i := range left {
		l := left[i]
		r := right[i]

		if l > r {
			sum += l - r
		} else {
			sum += r - l
		}
	}

	fmt.Println("Result", sum)

	// --- Part 2 ---
	score := 0

	for i := range left {
		val := left[i]
		count := 0

		for j := range right {
			r := right[j]

			if r == val {
				count += 1
			} else if r > val {
				break
			}
		}

		score += val * count
	}

	fmt.Println("Result", score)
}
