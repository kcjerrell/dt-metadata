import { type ColorMode, useColorMode } from "@/components/ui/color-mode"
import { Tooltip } from "@/components/ui/tooltip"
import { postMessage, useMessages } from "@/context/Messages"
import AppState from "@/hooks/useAppState"
import ImageStore from "@/utils/imageStore"
import {
	Box,
	ButtonGroup,
	type ButtonProps,
	HStack,
	IconButton,
	Spacer,
	VStack
} from "@chakra-ui/react"
import { relaunch } from "@tauri-apps/plugin-process"
import { AnimatePresence, motion } from "motion/react"
import { type ComponentProps, type PropsWithChildren, useEffect } from "react"
import { FiClipboard, FiCopy, FiXCircle } from "react-icons/fi"
import { GrPin } from "react-icons/gr"
import type { IconType } from "react-icons/lib"
import { useSnapshot } from "valtio"
import { loadImage2 } from "./state/imageLoaders"
import { clearAll, MetadataStore, pinImage } from "./state/store"

const MotionVStack = motion.create(VStack)
type ToolbarProps = ComponentProps<typeof MotionVStack>

function Toolbar(props: ToolbarProps) {
	const { ...restProps } = props

	const { currentImage } = useSnapshot(MetadataStore)

	const messageChannel = useMessages("toolbar")

	return (
		<HStack padding={2} data-tauri-drag-region height={"3rem"}>
			<Spacer data-tauri-drag-region />
			<Box
				position={"relative"}
				alignItems={"flex-start"}
				display={"flex"}
				justifyContent={"center"}
				overflow={"visible"}
				maxHeight={"100%"}
			>
				<MotionVStack
					gap={0}
					bgColor={"bg.1"}
					flex={"0 0 auto"}
					borderRadius={"xl"}
					border={"pane1"}
					borderBottom={messageChannel.messages.length ? "0px" : "1px"}
					overflow={"hidden"}
					boxShadow={"pane1"}
					height={"auto"}
					width="min-content" // 👈 shrink-wrap to content
					align="stretch" // 👈 don’t stretch children
					initial={false}
					layout
					{...restProps}
				>
					<ButtonGroup variant={"ghost"} gap={0} asChild>
						<HStack>
							<ToolbarButton
								icon={FiClipboard}
								tip={'Load image from clipboard'}
								onClick={async () => {
									try {
										await loadImage2("general")
									} catch (e) {
										console.error(e)
									}
								}}
							/>
							<ToolbarButton
								tip={currentImage?.pin ? "Unpin image" :"Pin image"}
								onClick={() => {
									const pin = currentImage?.pin !== null ? null : true
									pinImage(true, pin)
									postMessage({
										message: pin ? "Image pinned" : "Pin removed",
										uType: "pinimage",
										duration: 2000,
										channel: "toolbar",
									})
								}}
							>
								<Pinned pin={currentImage?.pin} />
							</ToolbarButton>
							<ToolbarButton tip={"Clear unpinned images"} icon={FiXCircle} onClick={() => clearAll(true)} />
							<ToolbarButton
								icon={FiCopy}
								tip={"Copy image"}
								onClick={async () => {
									if (!currentImage) return
									await ImageStore.copy(currentImage?.id)
									postMessage({
										message: "Image copied to clipboard",
										duration: 2000,
										channel: "toolbar",
									})
								}}
							/>
							<UpgradeButton />
						</HStack>
					</ButtonGroup>
					<AnimatePresence>
						{messageChannel.messages.map((message, i, msgs) => (
							<Box
								asChild
								key={`msg_${message.id}`}
								_before={
									i > 0 && msgs.length > 1
										? {
												content: '""',
												display: "block",
												height: "1px",
												width: "70%",
												bg: "fg.1/50",
												marginX: "auto",
											}
										: undefined
								}
								overflow={"hidden"}
								maxWidth={"100%"}
							>
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.1 }}
								>
									<Box
										p={1}
										width={"100%"}
										textAlign={"center"}
										fontSize={"sm"}
										color={"fg.2"}
										// _before={{ content: '""', display: "block", height: "1px", bg: "fg.1/50" }}
									>
										{message.message}
									</Box>
								</motion.div>
							</Box>
						))}
					</AnimatePresence>
				</MotionVStack>
			</Box>
			<Spacer data-tauri-drag-region bgColor={"green/2"} />
		</HStack>
	)
}

const UpgradeButton = (props) => {
	const appState = useSnapshot(AppState.store)

	useEffect(() => {
		if (appState.updateStatus === "unknown") AppState.checkForUpdate()
	}, [appState.updateStatus])

	if (["checking", "unknown", "none"].includes(appState.updateStatus)) return null

	if (["found", "ready", "installed"].includes(appState.updateStatus)) {
		return (
			<ToolbarButton
				icon={UpgradeIcon}
				tip={appState.updateStatus}
				onClick={async () => {
					if (appState.updateStatus === "found") await AppState.downloadUpdate()
					else if (appState.updateStatus === "ready") await AppState.installUpdate()
					else if (appState.updateStatus === "installed") await relaunch()
				}}
			/>
		)
	}

	if (appState.updateStatus === "downloading") {
		return <Box>{(appState.updateProgress / appState.updateSize) * 100}%</Box>
	}
}

export const ToolbarButton = (
	props: PropsWithChildren<ButtonProps & { onClick?: () => void; icon?: IconType; tip?: string }>,
) => {
	const { icon: Icon, children, onClick, tip, ...restProps } = props

	const content = Icon ? <Icon /> : children

	return (
		<Tooltip content={tip} contentProps={{fontSize: "sm", bgColor: "bg.3", color: "fg.1"}} >
			<IconButton
				color={"fg.3"}
				_hover={{
					bg: "unset",
					scale: 1.35,
					color: "fg.1",
				}}
				scale={1.2}
				size={"sm"}
				onClick={onClick}
				{...restProps}
			>
				{content}
			</IconButton>
		</Tooltip>
	)
}

export const Pinned = ({ pin }: { pin?: number | null }) => {
	const isPinned = pin != null

	const UnPinned = motion(GrPin)

	if (isPinned)
		return (
			<motion.svg
				width="200"
				height="200"
				viewBox="0 0 200 200"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g>
					<g transform="translate(20.354 33.361)">
						<path
							d="M127.923 6.10352e-05L111.281 6.10352e-05L31.427 0L14.7855 0L14.7855 17L31.427 17L31.427 79.3885C26.7625 82.8089 22.1701 87.2347 17.65 92.6658C5.88328 106.804 -4.1008e-05 122.747 0 140.493L0 148.993L142.708 148.993L142.708 140.493C142.708 122.728 136.813 106.772 125.024 92.6255C120.505 87.2027 115.924 82.7894 111.281 79.3857L111.281 17.0001L127.923 17.0001L127.923 6.10352e-05L127.923 6.10352e-05ZM48.427 88.7375L48.427 17.0001L94.2809 17.0001L94.2809 88.7375L98.4077 91.2136C102.822 93.8623 107.341 97.9607 111.965 103.509C119.186 112.175 123.562 121.67 125.092 131.993L17.6164 131.993C19.1439 121.683 23.5107 112.199 30.7166 103.541C35.3318 97.9953 39.8597 93.8863 44.3002 91.2135L44.3082 91.2087L48.427 88.7375L48.427 88.7375Z"
							fill="currentColor"
							transform="translate(8 0)"
						/>
					</g>
				</g>
			</motion.svg>
		)

	return <UnPinned />
}

const UpgradeIcon = () => {
	const { colorMode } = useColorMode()

	return (
		<motion.svg
			width="200"
			height="200"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			// style={{ scaleX: 1, scaleY: 1 }}
			animate={{
				// filter: ["drop-shadow(3px 3px 2px #000000)"]
				// boxShadow: ["3px 3px 2px #000000"]
				y: [0, 0, 1, -2, 1, -2, 0],
				// scale: [1, 1.2]
			}}
			transition={{
				duration: 5,
				times: [0, 0.5, 0.7, 0.725, 0.8, 0.825, 1],
				repeat: Infinity,
				repeatType: "loop",
				ease: "easeOut",
				delay: 0.7,
			}}
			whileHover={{ y: 0 }}
			// style={{ scale: 2 }}
		>
			<g>
				<UpgradePath
					i={2}
					d={
						"M90.2344 0L0 60.1562L0 101.706L90.2344 41.55L180.469 101.706L180.469 60.1562L90.2344 0Z"
					}
					colorMode={colorMode}
					tx={9.766}
					ty={11.647}
				/>
				<UpgradePath
					i={1}
					d="M58.9844 0L0 39.8141L0 75.0809L58.9844 35.2664L117.969 75.0809L117.969 39.8141L58.9844 0Z"
					tx={41.016}
					ty={61.664}
					colorMode={colorMode}
				/>
				<UpgradePath
					i={0}
					d="M33.9844 0L0 22.9395L0 49.3457L33.9844 26.6895L67.9688 49.3457L67.9688 22.9395L33.9844 0Z"
					tx={66.016}
					ty={105.414}
					colorMode={colorMode}
				/>
				{/* <UpgradePath
					i={0}
					d="M33.9844 0L0 22.6562L0 47.8L33.9844 25.1438L67.9688 47.8L67.9688 22.6563L33.9844 0Z"
					tx={66.016}
					ty={140.553}
					colorMode={colorMode}
				/> */}
			</g>
		</motion.svg>
	)
}
// 11.647, 61.664, 105.414, 140.553
const UpgradePath = ({
	d,
	tx,
	ty,
	i,
	colorMode,
}: {
	d: string
	tx: number
	ty: number
	i: number
	colorMode: ColorMode
}) => {
	const colorDuration = 5
	const fg = colorMode === "light" ? "#565e67" : "#8e97a2"
	const fgb = colorMode === "light" ? "#476d53ff" : "#66a676ff"
	return (
		<motion.path
			d={d}
			animate={{
				fill: [fgb, fg, "#83ff67ff", fgb],
				scale: [1, 1.1, 1.2, 1],
			}}
			transition={{
				duration: colorDuration,
				times: [0, 0.8, 0.9, 1],
				ease: ["easeOut", "linear", "linear"],
				repeat: Infinity,
				repeatType: "loop",
				delay: 0.1 * i, // (colorDuration * i) / 16,
			}}
			stroke-width="0"
			stroke="#000000"
			style={{ x: tx, y: ty * 1.3 }}
		/>
	)
}

export default Toolbar
