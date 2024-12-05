package main

import (
	"flag"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

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

func getRulesAndUpdates(input string) (map[int][]int, [][]int) {
	rule := true

	rules := make([][2]int, 0)
	updates := make([][]int, 0)

	for _, line := range strings.Split(input, "\n") {
		if line == "" {
			rule = false
			continue
		}

		if rule {
			parts := strings.Split(line, "|")
			lhs, _ := strconv.ParseInt(parts[0], 0, 64)
			rhs, _ := strconv.ParseInt(parts[1], 0, 64)
			rules = append(rules, [2]int{int(lhs), int(rhs)})
		} else {
			parts := strings.Split(line, ",")
			print := make([]int, len(parts))
			for i, part := range parts {
				num, _ := strconv.ParseInt(part, 0, 64)
				print[i] = int(num)
			}
			updates = append(updates, print)
		}
	}

	ruleMap := make(map[int][]int)
	for _, rule := range rules {
		ruleMap[rule[0]] = append(ruleMap[rule[0]], rule[1])
	}

	return ruleMap, updates
}

func getIndexOf(update []int, no int) int {
	for i, p := range update {
		if p == no {
			return i
		}
	}
	return -1
}

func isCorrect(ruleMap map[int][]int, update []int) bool {
	for _, page := range update {
		pageRule, has := ruleMap[page]

		if !has {
			continue
		}

		targetIndex := getIndexOf(update, page)

		for _, pageRuleItem := range pageRule {
			index := getIndexOf(update, pageRuleItem)
			if index == -1 {
				continue
			}
			if targetIndex > index {
				// Target must be smaller, otherwise it's incorrect
				return false
			}
		}
	}

	return true
}

func partOne(data string) {
	ruleMap, updates := getRulesAndUpdates(data)
	sum := 0

	for _, update := range updates {
		if isCorrect(ruleMap, update) {
			mid := update[(len(update))/2]
			sum += mid
		}
	}

	fmt.Println("Result 1:", sum)
}

func partTwo(data string) {
	ruleMap, updates := getRulesAndUpdates(data)
	sum := 0

	for _, update := range updates {
		if isCorrect(ruleMap, update) {
			continue
		}

		// Is i less than j?
		sort.SliceStable(update, func(i, j int) bool {
			lhs := update[i]
			rhs := update[j]

			rules, has := ruleMap[lhs]
			if !has {
				return false
			}

			ruleIndex := getIndexOf(rules, rhs)
			if ruleIndex == -1 {
				return false
			}

			// lhs must be less than rhs, because the rule for lhs has rhs in it
			return true
		})

		mid := update[len(update)/2]
		sum += mid
	}

	fmt.Println("Result 2:", sum)
}
