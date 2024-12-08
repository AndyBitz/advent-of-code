package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

type Point struct {
	x int
	y int
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

func parseMap(raw string) ([][]string, map[string][]Point) {
	antennas := make(map[string][]Point)
	grid := make([][]string, 0)

	for x, row := range strings.Split(raw, "\n") {
		parsedRow := make([]string, 0)

		for y, col := range strings.Split(row, "") {
			parsedRow = append(parsedRow, col)
			if col == "." {
				continue
			}

			antennas[col] = append(antennas[col], Point{x, y})
		}

		grid = append(grid, parsedRow)
	}

	return grid, antennas
}

func isInBounds(point Point, maxX int, maxY int) bool {
	if point.x >= maxX || point.x < 0 {
		return false
	}

	if point.y >= maxY || point.y < 0 {
		return false
	}

	return true
}

func partOne(input string) {
	grid, antennas := parseMap(input)

	maxX := len(grid)
	maxY := len(grid[0])

	possible := make(map[Point]bool)

	for _, positions := range antennas {
		for i, one := range positions {
			for j, two := range positions {
				if i == j {
					continue
				}

				vec := Point{x: two.x - one.x, y: two.y - one.y}
				anti := Point{x: two.x + vec.x, y: two.y + vec.y}
				if isInBounds(anti, maxX, maxY) {
					possible[anti] = true
				}
			}
		}
	}

	fmt.Println("Result 1:", len(possible))
}

func partTwo(input string) {
	grid, antennas := parseMap(input)

	maxX := len(grid)
	maxY := len(grid[0])

	possible := make(map[Point]bool)

	for _, positions := range antennas {
		for i, one := range positions {
			for j, two := range positions {
				if i == j {
					continue
				}

				count := 0
				vec := Point{x: two.x - one.x, y: two.y - one.y}

				for {
					count += 1
					anti := Point{x: one.x + (count * vec.x), y: one.y + (count * vec.y)}

					if isInBounds(anti, maxX, maxY) {
						possible[anti] = true
					} else {
						break
					}
				}
			}
		}
	}

	fmt.Println("Result 2:", len(possible))
}
