import {
	Box,
	ButtonGroup,
	type ButtonProps,
	HStack,
	IconButton,
	Spacer,
	VStack,
} from "@chakra-ui/react"
import { relaunch } from "@tauri-apps/plugin-process"
import { AnimatePresence, motion } from "motion/react"
import { type ComponentProps, type PropsWithChildren, useEffect } from "react"
import { FiClipboard, FiCopy, FiXCircle } from "react-icons/fi"
import { GrPin } from "react-icons/gr"
import type { IconType } from "react-icons/lib"
import { useSnapshot } from "valtio"
import Tooltip from '@/components/Tooltip'
import { type ColorMode, useColorMode } from "@/components/ui/color-mode"
import { postMessage, useMessages } from "@/context/Messages"
import AppState from "@/hooks/useAppState"
import ImageStore from "@/utils/imageStore"
import { loadImage2 } from "./state/imageLoaders"
import { clearAll, MetadataStore, pinImage } from "./state/store"

const MotionVStack = motion.create(VStack)
type ToolbarProps = ComponentProps<typeof MotionVStack>

function Toolbar(props: ToolbarProps) {
	const { ...restProps } = props

	const { currentImage } = useSnapshot(MetadataStore)

	const messageChannel = useMessages("toolbar")

	console.debug('toolbar render')

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
								tip={"Load image from clipboard"}
								onClick={async () => {
									try {
										await loadImage2("general")
									} catch (e) {
										console.error(e)
									}
								}}
							/>
							<ToolbarButton
								tip={currentImage?.pin ? "Unpin image" : "Pin image"}
								onClick={() => {
									const pin = MetadataStore.currentImage?.pin !== null ? null : true
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
							<ToolbarButton
								tip={"Clear unpinned images"}
								icon={FiXCircle}
								onClick={() => clearAll(true)}
							/>
							<ToolbarButton
								icon={FiCopy}
								tip={"Copy image"}
								onClick={async () => {
									if (!MetadataStore.currentImage) return
									await ImageStore.copy(MetadataStore.currentImage?.id)
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

const statusTips = {
	found: "Download update",
	installed: "Click to finish update",
	error: "Click to retry update",
	downloading: "Downloading update",
	installing: "Installing update",
} as const
function getStatusTip(status: typeof AppState.store["updateStatus"]) {
	if (status in statusTips) return statusTips[status as keyof typeof statusTips]
	else return undefined
}

const UpgradeButton = () => {
	const appState = useSnapshot(AppState.store)

	useEffect(() => {
		if (appState.updateStatus === "unknown") AppState.checkForUpdate()
	}, [appState.updateStatus])

	if (appState.updateAttempts >= 3) return null

	if (["checking", "unknown", "none"].includes(appState.updateStatus)) return null

	if (["found", "installed", "error"].includes(appState.updateStatus)) {
		return (
			<ToolbarButton
				icon={UpgradeIcon}
				tip={getStatusTip(appState.updateStatus)}
				onClick={async () => {
					if (AppState.store.updateStatus === "found") {
						await AppState.downloadAndInstallUpdate()
					}
					else if (appState.updateStatus === "installed") await relaunch()
					else if (appState.updateStatus === "error") await AppState.retryUpdate()
				}}
			/>
		)
	}

	if (appState.updateStatus === "downloading" || appState.updateStatus === "installing") {
		return <ToolbarButton icon={Spinner} tip={statusTips[appState.updateStatus]} />
	}
}

export const ToolbarButton = (
	props: PropsWithChildren<ButtonProps & { onClick?: () => void; icon?: IconType; tip?: string }>,
) => {
	const { icon: Icon, children, onClick, tip, ...restProps } = props

	const content = Icon ? <Icon /> : children

	return (
		<Tooltip tip={tip}>
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
			</g>
		</motion.svg>
	)
}

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

function Spinner() {
	return (
		<motion.svg
			width="200"
			height="200"
			viewBox="-100 -100 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* <ellipse cx="100" cy="100" rx="100" ry="100" fill="white" /> */}
			<defs>
				<linearGradient
					id={"gradient_1"}
					gradientUnits="userSpaceOnUse"
					x1="74.5"
					y1="0"
					x2="74.5"
					y2="149"
				>
					<stop offset="0" stop-color="#FF0000" />
					<stop offset="1" stop-color="#808080" />
				</linearGradient>
			</defs>
			<g>
				{/* <path d="M0 74.5C0 33.3548 36.75 0 74 0C111.25 0 149 33.3548 149 74.5C149 115.645 115.645 149 74.5 149" /> */}
				{/* <path
					d="M74.5 149L74.5 148Q104.945 148 126.472 126.472Q148 104.945 148 74.5Q148 44.7573 124.778 22.5432Q114.202 12.4271 101.039 6.77341Q87.5969 1 74 0.999992Q60.4157 1 47.1209 6.77185Q34.1226 12.4149 23.7289 22.537Q1 44.6719 1 74.5L0 74.5C0 33.3548 36.75 0 74 0C111.25 0 149 33.3548 149 74.5C149 115.645 115.645 149 74.5 149Z"
					fill="none"
					fill-rule="evenodd"
					stroke="url(#gradient_1)"
					stroke-width="5"
				/> */}
				{Array.from({ length: 8 }).map((_, i, arr) => {
					const n = arr.length
					const x1 = Math.cos((2 * Math.PI * i) / n) * 70
					const y1 = Math.sin((2 * Math.PI * i) / n) * 70

					return (
						<motion.ellipse
							// biome-ignore lint/suspicious/noArrayIndexKey: range id
							key={i}
							cx={x1}
							cy={y1}
							rx={0}
							ry={0}
							fill={"#51ac35"}
							style={{
								rotate: (i / n) * 360,
							}}
							animate={{
								rx: [0, 30, 0],
								ry: [0, 30, 0],
								fill: ["#51ac3500", "#51ac35ff", "#51ac3500"],
								
							}}
							transition={{
								delay: i / n,
								duration: 1,
								times: [0, 0.1, 1],
								// ease: ['circOut', 'circOut',],
								repeat: Infinity,
								repeatType: "loop",
							}}
						/>
					)
				})}
			</g>
		</motion.svg>
	)
}

export default Toolbar
