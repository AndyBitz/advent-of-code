package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
)

func part(path string, length int) {
	file, err := os.Open(path)
	if err != nil {
		panic(err)
	}

	scanner := bufio.NewScanner(file)
	if err := scanner.Err(); err != nil {
		panic(err)
	}
	defer (func() {
		err := file.Close()
		if err != nil {
			panic(err)
		}
	})()

	sum := 0

	highestDigit := func(input string) (int, int) {
		high := 0
		index := 0

		for i := range len(input) {
			n := int(input[i] - '0') // Convert digit to integer
			if n > high {
				high = n
				index = i
			}
		}

		return high, index
	}

	combineBuffer := func(list []int) int {
		digits := make([]rune, len(list))
		for i := range len(list) {
			digits[i] = rune(list[i] + '0')
		}
		n, _ := strconv.Atoi(string(digits))
		return n
	}

	for scanner.Scan() {
		line := scanner.Text()

		buf := make([]int, length)

		for i := range length {
			// Determine how many digits we can look at to still get the whole number
			lower := (len(line) - (length - i)) + 1
			cut := line[:lower]

			high, index := highestDigit(cut)
			buf[i] = high // Add the highest digit to the buffer

			// Keep only the unused part of the line
			line = line[index+1:]
		}

		bank := combineBuffer(buf)
		sum += bank
	}

	fmt.Printf("Result %d\n", sum)
}

func main() {
	path := "./input-0.txt"
	part(path, 2)
	part(path, 12)
}
