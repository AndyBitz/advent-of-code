package main

import (
	"container/list"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type MemoryType int

const (
	Free MemoryType = iota
	File
)

type Memory struct {
	memType MemoryType
	size    int
	id      int
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

func getNextType(memType MemoryType) MemoryType {
	if memType == Free {
		return File
	}
	return Free
}

func parseInput(input string) *list.List {
	list := list.New()

	currentId := -1
	fileType := Free

	for _, digit := range strings.Split(input, "") {
		numb, _ := strconv.ParseInt(digit, 0, 64)
		size := int(numb)

		fileType = getNextType(fileType)
		fileId := 0

		if fileType == File {
			currentId += 1
			fileId = currentId
		}

		list.PushBack(Memory{fileType, size, fileId})
	}

	return list
}

func printList(l *list.List) {
	for e := l.Front(); e != nil; e = e.Next() {
		val, _ := e.Value.(Memory)
		for range val.size {
			if val.memType == Free {
				fmt.Print(".")
			} else {
				fmt.Print(val.id)
			}
		}
	}
	fmt.Print("\n")
}

func partOne(input string) {
	list := parseInput(input)

	for start := list.Front(); start != nil; start = start.Next() {
		if start.Value.(Memory).memType == File {
			continue
		}

		for end := list.Back(); end != start; end = end.Prev() {
			if end.Value.(Memory).memType == Free {
				continue
			}

			free := start.Value.(Memory)
			file := end.Value.(Memory)

			if free.size > file.size {
				start.Value = Memory{Free, free.size - file.size, free.id}
				end.Value = Memory{Free, 0, 0}
				list.InsertBefore(Memory{File, file.size, file.id}, start)
				continue
			} else if free.size == file.size {
				start.Value = file
				end.Value = free
			} else {
				start.Value = Memory{File, free.size, file.id}
				end.Value = Memory{File, file.size - free.size, file.id}
			}

			break
		}
	}

	sum := 0
	pos := 0

	for e := list.Front(); e != nil; e = e.Next() {
		mem := e.Value.(Memory)
		if mem.memType == Free {
			break
		}

		for range mem.size {
			sum += pos * mem.id
			pos++
		}
	}

	fmt.Println("Result 1", sum)
}

func partTwo(input string) {
	list := parseInput(input)

	for end := list.Back(); end != nil; end = end.Prev() {
		if end.Value.(Memory).memType == Free {
			continue
		}

		for start := list.Front(); start != end; start = start.Next() {
			if start.Value.(Memory).memType == File {
				continue
			}

			free := start.Value.(Memory)
			file := end.Value.(Memory)

			if free.size > file.size {
				start.Value = Memory{File, file.size, file.id}
				end.Value = Memory{Free, file.size, 0}
				list.InsertAfter(Memory{Free, free.size - file.size, 0}, start)
				break
			} else if free.size == file.size {
				start.Value = file
				end.Value = free
				break
			}
		}
	}

	sum := 0
	pos := 0

	for e := list.Front(); e != nil; e = e.Next() {
		mem := e.Value.(Memory)
		for range mem.size {
			if mem.memType == File {
				sum += pos * mem.id
			}

			pos++
		}
	}

	fmt.Println("Result 2", sum)
}
