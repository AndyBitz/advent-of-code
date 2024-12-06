package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

type Direction int

const (
	North Direction = iota
	East
	South
	West
)

type Coord struct {
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

func parseMap(input string) ([][]bool, Coord) {
	grid := make([][]bool, 0) // `true` implies an obstacle
	guard := Coord{0, 0}

	for x, row := range strings.Split(input, "\n") {
		chars := strings.Split(row, "")
		gridRow := make([]bool, len(chars))

		for y, col := range chars {
			if col == "#" {
				gridRow[y] = true
			} else if col == "." {
				gridRow[y] = false
			} else if col == "^" {
				gridRow[y] = false
				guard = Coord{x, y}
			}
		}

		grid = append(grid, gridRow)
	}

	return grid, guard
}

func getFront(guard Coord, dir Direction) Coord {
	x := guard.x
	y := guard.y

	switch dir {
	case North:
		x = x - 1
	case East:
		y = y + 1
	case South:
		x = x + 1
	case West:
		y = y - 1
	}

	return Coord{x, y}
}

func hasObstacleInFront(grid *[][]bool, guard Coord, dir Direction) (bool, bool, Coord) {
	nextGuard := getFront(guard, dir)
	x := nextGuard.x
	y := nextGuard.y

	if len(*grid) <= x || x < 0 {
		return false, true, nextGuard
	}

	if len((*grid)[x]) <= y || y < 0 {
		return false, true, nextGuard
	}

	return (*grid)[x][y], false, nextGuard
}

func getNextDirection(dir Direction) Direction {
	switch dir {
	case North:
		return East
	case East:
		return South
	case South:
		return West
	case West:
		return North
	default:
		panic("Invalid direction")
	}
}

func partOne(data string) {
	grid, guard := parseMap(data)
	dir := North

	visited := make(map[Coord]bool)
	visited[guard] = true

	for {
		hasObstacle, isOut, nextGuard := hasObstacleInFront(&grid, guard, dir)

		if hasObstacle {
			dir = getNextDirection(dir)
			continue
		}

		visited[guard] = true
		guard = nextGuard

		if isOut {
			break
		}
	}

	fmt.Println("Result 1:", len(visited))
}

func partTwo(data string) {
	initGrid, initGuard := parseMap(data)

	// Consider an obstacle successful if the guard stands before it,
	// facing the same direction,
	// two times

	possible := 0

	for x := range initGrid {
		for y := range initGrid[x] {
			if initGrid[x][y] {
				continue // Ignore, there already is an obstacle
			}

			if initGuard.x == x && initGuard.y == y {
				continue // Ignore, the guard is starting here
			}

			// Create a new copy of the guard and grid
			grid, guard := parseMap(data)
			dir := North

			grid[x][y] = true
			steps := 0
			maxSteps := 5067 * 20

			for range maxSteps {
				steps++

				hasObstacle, isOut, nextGuard := hasObstacleInFront(&grid, guard, dir)

				if hasObstacle {
					dir = getNextDirection(dir)
					continue
				}

				guard = nextGuard

				if isOut {
					break
				}
			}

			if maxSteps == steps {
				possible += 1
			}
		}
	}

	fmt.Println("Result 2:", possible)
}
