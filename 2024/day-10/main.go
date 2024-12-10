package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
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

func parseInput(input string) ([][]int, map[Point]bool, map[Point]bool) {
	grid := make([][]int, 0)
	heads := make(map[Point]bool)
	tails := make(map[Point]bool)

	for x, line := range strings.Split(input, "\n") {
		row := make([]int, 0)

		for y, col := range strings.Split(line, "") {
			n, _ := strconv.ParseInt(col, 0, 64)
			row = append(row, int(n))

			if n == 0 {
				heads[Point{x, y}] = true
			} else if n == 9 {
				tails[Point{x, y}] = true
			}
		}

		grid = append(grid, row)
	}

	return grid, heads, tails
}

func getNeighbours(grid *[][]int, start Point) []Point {
	maxX, maxY := len(*grid), len((*grid)[0])
	x, y := start.x, start.y
	target := (*grid)[x][y] + 1
	list := make([]Point, 0)

	// North
	if x-1 >= 0 && target == (*grid)[x-1][y] {
		list = append(list, Point{x - 1, y})
	}

	// East
	if maxY > y+1 && target == (*grid)[x][y+1] {
		list = append(list, Point{x, y + 1})
	}

	// South
	if maxX > x+1 && target == (*grid)[x+1][y] {
		list = append(list, Point{x + 1, y})
	}

	// West
	if y-1 >= 0 && target == (*grid)[x][y-1] {
		list = append(list, Point{x, y - 1})
	}

	return list
}

// Added for fun, `getNeighbours` is all you'd need
func bfs(grid *[][]int, start Point, end Point) bool {
	visited := make(map[Point]bool)
	queue := make([]Point, 0)

	visited[start] = true
	queue = append(queue, start)

	for {
		if len(queue) == 0 {
			break
		}

		p := queue[0]
		queue = queue[1:]

		if p == end {
			return true
		}

		for _, neighbour := range getNeighbours(grid, p) {
			if !visited[neighbour] {
				queue = append(queue, neighbour)
			}
		}
	}

	return false
}

func getRating(grid *[][]int, start Point, end Point) int {
	count, neighbours := 0, getNeighbours(grid, start)

	for _, neighbour := range neighbours {
		if neighbour == end {
			count += 1
		} else {
			count += getRating(grid, neighbour, end)
		}
	}

	return count
}

func partOne(input string) {
	grid, heads, tails := parseInput(input)
	trails := 0

	for head := range heads {
		for tail := range tails {
			if bfs(&grid, head, tail) {
				trails += 1
			}
		}
	}

	fmt.Println("Result 1:", trails)
}

func partTwo(input string) {
	grid, heads, tails := parseInput(input)
	ratings := 0

	for head := range heads {
		for tail := range tails {
			ratings += getRating(&grid, head, tail)
		}
	}

	fmt.Println("Result 2:", ratings)
}
