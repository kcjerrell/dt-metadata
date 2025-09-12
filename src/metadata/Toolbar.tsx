import {
	ButtonGroup,
	HStack,
	IconButton,
	Spacer,
	type StackProps,
} from "@chakra-ui/react";
import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { FiClipboard, FiXCircle } from "react-icons/fi";
import { GrPin } from "react-icons/gr";
import type { IconType } from "react-icons/lib";
import { useSnapshot } from "valtio";
import { clearImages, MetadataStore, pinImage } from "./store";
import { loadFromPasteboard } from "./state/imageLoaders";
import { toaster } from "@/components/ui/toaster";

interface ToolbarProps extends StackProps {}

function Toolbar(props: ToolbarProps) {
	const { ...restProps } = props;

	const { currentImage } = useSnapshot(MetadataStore);

	return (
		<HStack padding={2} data-tauri-drag-region>
			<Spacer data-tauri-drag-region />
			<ButtonGroup
				bgColor={"bg.1"}
				flex={"0 0 auto"}
				// size={'md'}
				height={"2.4rem"}
				variant={"ghost"}
				// colorPalette={'blue'}
				borderRadius={"xl"}
				boxShadow={"lg"}
				border={"1px solid {gray/20}"}
				gap={0}
				{...restProps}
				asChild
			>
				<HStack gap={0}>
					<ToolbarButton
						icon={FiClipboard}
						onClick={async () => {
							// const bytes = await invoke<Uint8Array>('read_clipboard_png')
							// // Convert bytes to Blob
							// console.log('got bytes', bytes.length)
							// addImage(bytes)
							// const types = await clipboard.getAvailableTypes()
							// console.log(types)
							// if (types.image) {
							//   const url = await clipboard.readImageBinary('Uint8Array')

							//   addImage(url)
							// }
							// const types = await invoke("read_clipboard_types")
							// console.log(types)
							// const url =
							//   // 'https://cdn.discordapp.com/attachments/1059883294486953984/1413470831375286272/he_is_on_a_white_background_-__2829551034.png?ex=68bf588b&is=68be070b&hm=781ae7399b9c3f45a2a80ec30ff1284e61cc678f6a1e84cf56810ea0be4edfbc&'
							//   'https://cdn.discordapp.com/attachments/1095620416065781790/1413489634838839438/0_scaly_crocodile_unicorn___pegasus_full_body_portrait_2171547597.png?ex=68bf6a0e&is=68be188e&hm=c5b0df21d73ef39bb8036285f1b47a15809852d652a603f46312d7dbc4531438&'
							// const data = await invoke('fetch_image_file', { url })
							// console.log(data)
							// addImage(data)
							try {
								await loadFromPasteboard();
							} catch (e) {
								console.error(e);
							}
						}}
					/>
					<ToolbarButton
						onClick={() => {
							pinImage(true, currentImage?.pin !== null ? null : true);
							toaster.create({title: 'Pinned Image', description: 'Image has been pinned', type: 'success'});
						}}
					>
						<Pinned pin={currentImage?.pin} />
					</ToolbarButton>
					<ToolbarButton icon={FiXCircle} onClick={clearImages} />
				</HStack>
			</ButtonGroup>
			<Spacer data-tauri-drag-region />
		</HStack>
	);
}

const ToolbarButton = (
	props: PropsWithChildren<{ onClick?: () => void; icon?: IconType }>,
) => {
	const { icon: Icon, children, onClick, ...restProps } = props;

	const content = Icon ? <Icon /> : children;

	return (
		<IconButton
			color={"fg.3"}
			_hover={{
				bg: "unset",
				scale: 1.05,
				color: "fg.1",
			}}
			onClick={onClick}
			{...restProps}
		>
			{content}
		</IconButton>
	);
};

const Pinned = ({ pin }: { pin: number | null }) => {
	const isPinned = pin != null;

	const UnPinned = motion(GrPin);

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
		);

	return <UnPinned />;
};

function base64ToUint8Array(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export default Toolbar;
