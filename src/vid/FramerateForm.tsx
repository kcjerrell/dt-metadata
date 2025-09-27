"use client"

import { useState } from "react"
import {
	Box,
	VStack,
	HStack,
	Text,
	Input,
	Button,
	createListCollection,
	Select,
  SimpleGrid,
} from "@chakra-ui/react"
import { NumberInputField, NumberInputRoot } from "@/components/ui/number-input"

const interpolationCollection = createListCollection({
	items: ["none", "simple", "blend", "motion", "interpolate"],
})

export default function FramerateForm() {
	const [inputFiles, setInputFiles] = useState<FileList | null>(null)
	const [outputPath, setOutputPath] = useState("")
	const [fps, setFps] = useState<number>(60)
	const [mode, setMode] = useState("motion")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// Replace with your actual ffmpeg command builder
		console.log({
			inputFiles,
			outputPath,
			fps,
			mode,
		})
	}

	return (
		<Box
			as="form"
			onSubmit={handleSubmit}
			maxW="lg"
      margin={4}
			borderWidth="1px"
			borderRadius="xl"
			shadow="md"
      bgColor={'bg.2'}
		>
			<SimpleGrid gridTemplateColumns={'min-content 1fr'} align="stretch">
				{/* Input videos */}
				
					<Text fontWeight="medium">
						Input video(s)
					</Text>
					<Input
						type="file"
						multiple
						accept="video/*"
						onChange={(e) => setInputFiles(e.target.files)}
					/>
				

				{/* Output path */}
				
					<Text fontWeight="medium">
						Output file
					</Text>
					<Input
						placeholder="output.mp4"
						value={outputPath}
						onChange={(e) => setOutputPath(e.target.value)}
					/>
				

				{/* Desired FPS */}
				
					<Text fontWeight="medium">
						Desired FPS
					</Text>
					<NumberInputRoot
						value={fps.toString()}
						min={1}
						max={240}
						step={1}
						onChange={(value) => setFps(parseInt(value.currentTarget.nodeValue, 10) || 0)}
					>
						<NumberInputField />
					</NumberInputRoot>
				

				{/* Interpolation mode */}
				
					<Text fontWeight="medium">
						Interpolation mode
					</Text>
					<Select.Root
						collection={interpolationCollection}
						value={[mode]}
						onValueChange={(e) => setMode(e.value[0])}
					>
						<Select.Control>
							<Select.Trigger>
								<Select.ValueText />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
								<Select.ClearTrigger />
							</Select.IndicatorGroup>
						</Select.Control>
						<Select.Positioner>
							<Select.Content>
								{interpolationCollection.items.map((item) => (
									<Select.Item item={item} key={item}>
										{item}
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Select.Root>
				

				{/* Submit */}
				
				
			</SimpleGrid>
					<Button type="submit" colorScheme="blue">
						Start Conversion
					</Button>
		</Box>
	)
}
