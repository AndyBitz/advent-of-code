package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

type Direction int

const (
	Up Direction = iota
	Right
	Down
	Left
)

type Point struct {
	x int
	y int
}

type PointWithDirection struct {
	x   int
	y   int
	dir Direction
}

type Area = map[Point]int

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

func parseInput(input string) [][]string {
	grid := make([][]string, 0)
	for _, line := range strings.Split(input, "\n") {
		row := make([]string, 0)
		for _, char := range strings.Split(line, "") {
			row = append(row, char)
		}
		grid = append(grid, row)
	}
	return grid
}

func getNeighbours(grid *[][]string, pos Point) map[Direction]Point {
	maxX, maxY := len(*grid), len((*grid)[0])
	x, y := pos.x, pos.y
	list := make(map[Direction]Point)
	val := (*grid)[x][y]

	// North
	if x-1 >= 0 && val == (*grid)[x-1][y] {
		list[Up] = Point{x - 1, y}
	}

	// East
	if maxY > y+1 && val == (*grid)[x][y+1] {
		list[Right] = Point{x, y + 1}
	}

	// South
	if maxX > x+1 && val == (*grid)[x+1][y] {
		list[Down] = Point{x + 1, y}
	}

	// West
	if y-1 >= 0 && val == (*grid)[x][y-1] {
		list[Left] = Point{x, y - 1}
	}

	return list
}

func findAreaAndPerimeter(grid *[][]string, start Point) (Area, int, int) {
	pop, queue := start, make([]Point, 1)
	queue[0] = start

	area := make(Area) // map of an entire area, value is the perimeter
	perimeter := 0

	for {
		if len(queue) == 0 {
			break
		}

		pop, queue = queue[0], queue[1:]
		if _, ok := area[pop]; ok {
			continue
		}

		neighbours := getNeighbours(grid, pop)
		area[pop] = 4 - len(neighbours)
		perimeter += area[pop]

		for _, neighbour := range neighbours {
			if _, ok := area[neighbour]; ok {
				continue
			}

			queue = append(queue, neighbour)
		}
	}

	return area, len(area), perimeter
}

func partOne(input string) {
	grid := parseInput(input)
	visited := make(map[Point]bool)
	sum := 0

	for x := range grid {
		for y := range grid[x] {
			point := Point{x, y}
			if _, ok := visited[point]; ok {
				continue
			}

			points, area, perimeter := findAreaAndPerimeter(&grid, point)
			sum += area * perimeter

			for p := range points {
				visited[p] = true
			}
		}
	}

	fmt.Println("Result 1:", sum)
}

// Does not work when there are holes in the shape
// func countSides(grid *[][]string, start Point) int {
// 	letter := (*grid)[start.x][start.y]
// 	rows, cols := len(*grid), len((*grid)[0])
// 	dirs := [4]Point{{-1, 0}, {0, 1}, {1, 0}, {0, -1}}
// 	dir := Left
// 	cur := start
// 	count := 0
// 	visited := make(map[string]bool)

// 	isBoundary := func(point Point) bool {
// 		return point.x < 0 || point.y < 0 || point.x >= rows || point.y >= cols || (*grid)[point.x][point.y] != letter
// 	}

// 	resetAndPrintGrid(grid, &cur, count, dir)

// 	for {
// 		key := fmt.Sprintf("%d,%d,%d", cur.x, cur.y, dir)
// 		if visited[key] {
// 			break
// 		}
// 		visited[key] = true

// 		resetAndPrintGrid(grid, &cur, count, dir)
// 		time.Sleep(250 * time.Millisecond)

// 		nextDir := (dir + 1) % 4 // Try to go up
// 		nextPoint := Point{cur.x + dirs[nextDir].x, cur.y + dirs[nextDir].y}

// 		// Check if we can move in the new direction
// 		if !isBoundary(nextPoint) {
// 			// Yes, we can move in the new direction
// 			dir = nextDir
// 			cur = nextPoint
// 			count += 1 // Count the turn as a new side
// 		} else {
// 			// No, we can't move in the new direction
// 			nextPoint = Point{cur.x + dirs[dir].x, cur.y + dirs[dir].y}
// 			if !isBoundary(nextPoint) {
// 				// Continue straight if possible
// 				cur = nextPoint
// 			} else {
// 				// We hit a dead end; turn right (clockwise)
// 				dir = (dir + 3) % 4 // Clockwise turn
// 				count += 1
// 			}
// 		}
// 	}

// 	resetAndPrintGrid(grid, &cur, count, dir)
// 	time.Sleep(500 * time.Millisecond)

// 	return count
// }

// func resetAndPrintGrid(grid *[][]string, highlight *Point, count int, dir Direction) {
//  fmt.Print("\033[2J") // clear screen
// 	fmt.Print("\033[H") // back to top
// 	fmt.Printf("Checking: %v\n", highlight)
// 	fmt.Printf("Sides: %d Direction: %v\n", count, dir)

// 	for x := range *grid {
// 		for y := range (*grid)[x] {
// 			if (*highlight).x == x && (*highlight).y == y {
// 				fmt.Printf("\033[%dm", 30+dir)
// 				fmt.Print((*grid)[x][y])
// 				fmt.Print("\033[0m")
// 			} else {
// 				fmt.Print((*grid)[x][y])
// 			}
// 		}
// 		fmt.Print("\n")
// 	}
// }

func countCorners(grid *[][]string, area *Area) int {
	rows, cols := len(*grid), len((*grid)[0])
	corners := 0

	for point := range *area {
		letter := (*grid)[point.x][point.y]

		has := func(x, y int) bool {
			return x >= 0 && y >= 0 && y < cols && x < rows && (*grid)[x][y] == letter
		}

		x, y := point.x, point.y

		hasUp := has(x-1, y)
		hasLeft := has(x, y-1)
		hasRight := has(x, y+1)
		hasDown := has(x+1, y)

		hasUpLeft := has(x-1, y-1)
		hasUpRight := has(x-1, y+1)
		hasDownLeft := has(x+1, y-1)
		hasDownRight := has(x+1, y+1)

		// Is convex corner
		if !hasLeft && !hasUp {
			corners += 1
		}
		if !hasUp && !hasRight {
			corners += 1
		}
		if !hasRight && !hasDown {
			corners += 1
		}
		if !hasDown && !hasLeft {
			corners += 1
		}

		// Is concave corner
		if hasLeft && hasUp && !hasUpLeft {
			corners += 1
		}
		if hasUp && hasRight && !hasUpRight {
			corners += 1
		}
		if hasRight && hasDown && !hasDownRight {
			corners += 1
		}
		if hasDown && hasLeft && !hasDownLeft {
			corners += 1
		}
	}

	return corners
}

func partTwo(input string) {
	grid := parseInput(input)
	visited := make(map[Point]bool)
	sum := 0

	for x := range grid {
		for y := range grid[x] {
			point := Point{x, y}
			if _, ok := visited[point]; ok {
				continue
			}

			points, area, _ := findAreaAndPerimeter(&grid, point)
			corners := countCorners(&grid, &points)
			sum += area * corners

			for p := range points {
				visited[p] = true
			}
		}
	}

	fmt.Println("Result 2:", sum)
}
