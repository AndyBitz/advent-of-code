package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
)

func partOne(path string) {
	dial := 50
	counter := 0

	file, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}

	scanner := bufio.NewScanner(file)
	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	for scanner.Scan() {
		line := scanner.Text()
		action := line[:1]
		value, _ := strconv.Atoi(line[1:])
		// fmt.Printf("%s -> %d\n", action, value)

		switch action {
		case "L":
			dial = (dial - value) % 100
			if dial < 0 {
				dial = 100 + dial
			}
		case "R":
			dial = (dial + value) % 100
		}

		if dial == 0 {
			counter++
		}
	}

	fmt.Printf("Counter 1: %d\n", counter)
}

func partTwo(path string) {
	dial := 50
	counter := 0

	file, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

	for scanner.Scan() {
		line := scanner.Text()
		action := line[:1]
		value, _ := strconv.Atoi(line[1:])

		switch action {
		case "L":
			if dial-value <= 0 {
				pass := ((dial - value) / 100) * -1
				// When dial is 0 initially it should not count that
				if dial > 0 {
					pass += 1
				}
				
				counter += pass
			}

			dial = (dial - value) % 100
			if dial < 0 {
				dial = 100 + dial
			}
		case "R":
			pass := (dial + value) / 100
			counter += pass
			dial = (dial + value) % 100
		}
	}

	fmt.Printf("Counter 2: %d\n", counter)
}

func main() {
	file := "./input-1.txt"
	partOne(file)
	partTwo(file)
}

