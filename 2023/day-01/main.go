package main

import (
	"flag"
	"fmt"
	"os"
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

func partOne(data string) {
	var sum int64 = 0

	lines := strings.Split(data, "\n")

	for _, line := range lines {
		var first int64 = -1
		var last int64 = 0

		for _, c := range strings.Split(line, "") {
			num, err := strconv.ParseInt(c, 0, 64)
			if err != nil {
				continue
			}

			if first == -1 {
				first = num
			}

			last = num
		}

		text := strconv.Itoa(int(first)) + strconv.Itoa(int(last))
		num, _ := strconv.ParseInt(text, 0, 64)

		sum += num
	}

	fmt.Println("Result:", sum)
}

func partTwo(data string) {
	var sum int64 = 0

	lines := strings.Split(data, "\n")

	wordList := [...]string{"one", "two", "three", "four", "five", "six", "seven", "eight", "nine"}

	for _, line := range lines {
		chars := strings.Split(line, "")

		var first int64 = -1
		var last int64 = -1

		var set = func(num int64) {
			if first == -1 {
				first = num
			}

			last = num
		}

		for i := 0; i < len(chars); i++ {
			num, err := strconv.ParseInt(chars[i], 0, 64)
			if err == nil {
				set(num)
				continue
			}

			for j, prefix := range wordList {
				if strings.HasPrefix(line[i:], prefix) {
					set(int64(j + 1))
					break
				}
			}
		}

		text := strconv.Itoa(int(first)) + strconv.Itoa(int(last))
		num, _ := strconv.ParseInt(text, 0, 64)

		sum += num
	}

	fmt.Println("Result", sum)
}
