package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	wordPtr := flag.String("file", "./input-01.txt", "input file")
	flag.Parse()

	raw, fileErr := os.ReadFile(*wordPtr)
	if fileErr != nil {
		fmt.Println(fileErr)
		os.Exit(1)
	}

	partOne(string(raw))
	partTwo(string(raw))
}

func check(grid *[][]string, row int, col int, char string) bool {
	if len(*grid) <= row || row < 0 {
		return false
	}

	if len((*grid)[row]) <= col || col < 0 {
		return false
	}

	return (*grid)[row][col] == char
}

func partOne(mem string) {
	var grid [][]string = make([][]string, 0)
	for _, row := range strings.Split(mem, "\n") {
		grid = append(grid, strings.Split(row, ""))
	}

	valid := make(map[string]bool)
	count := 0

	for row := range grid {
		for col := range grid[row] {
			// Check north			=> x=0, y=1
			// Check east			=> x=1, y=0
			// Check south			=> x=-1, y=0
			// Check west			=> x=0, y=-1
			// Check north-east		=> x=1, y=1
			// Check north-west		=> x=1, y=-1
			// Check south-east		=> x=-1, y=1
			// Check south-west		=> x=-1, y=-1
			for _, x := range []int{-1, 1, 0} {
				for _, y := range []int{-1, 1, 0} {
					found := 0

					checkX := row
					checkY := col

					var checked [][2]int = make([][2]int, 4)

					for _, letter := range []string{"X", "M", "A", "S"} {
						if !check(&grid, checkX, checkY, letter) {
							break
						}

						found += 1

						checked = append(checked, [2]int{checkX, checkY})

						checkX += x
						checkY += y
					}

					if found == 4 {
						count += 1

						for _, coords := range checked {
							valid[fmt.Sprintf("%d,%d", coords[0], coords[1])] = true
						}
					}
				}
			}
		}
	}

	// for x := range grid {
	// 	for y := range grid[x] {

	// 		if valid[fmt.Sprintf("%d,%d", x, y)] {
	// 			fmt.Print(grid[x][y])
	// 		} else {
	// 			fmt.Print(".")
	// 		}
	// 	}

	// 	fmt.Print("\n")
	// }

	fmt.Println("Result:", count)
}

func partTwo(mem string) {
	var grid [][]string = make([][]string, 0)
	for _, row := range strings.Split(mem, "\n") {
		grid = append(grid, strings.Split(row, ""))
	}

	count := 0

	for row := range grid {
		for col := range grid[row] {
			if check(&grid, row, col, "A") { // "A" must be the center
				// Check north-west		=> x=1, y=-1
				// & check south-east	=> x=-1, y=1
				hasNWtoSE := (check(&grid, row+1, col-1, "M") && check(&grid, row-1, col+1, "S")) ||
					(check(&grid, row+1, col-1, "S") && check(&grid, row-1, col+1, "M"))

				// Check north-east		=> x=1, y=1
				// & check south-west	=> x=-1, y=-1
				hasNEtoSW := (check(&grid, row+1, col+1, "M") && check(&grid, row-1, col-1, "S")) ||
					(check(&grid, row+1, col+1, "S") && check(&grid, row-1, col-1, "M"))

				if hasNWtoSE && hasNEtoSW {
					count += 1
				}
			}
		}
	}

	fmt.Println("Result:", count)
}
