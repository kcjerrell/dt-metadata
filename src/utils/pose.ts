import { getPoses, isOpenPose, type OpenPose, type Pose2d } from "./poseHelpers"

const limbSeq = [
	[1, 2],
	[1, 5],
	[2, 3],
	[3, 4],
	[5, 6],
	[6, 7],
	[1, 8],
	[8, 9],
	[9, 10],
	[1, 11],
	[11, 12],
	[12, 13],
	[1, 0],
	[0, 14],
	[14, 16],
	[0, 15],
	[15, 17],
	// [2, 16],
	// [5, 17],
]

const limbSeqData = [
	[1, 2, "right shoulder", 192, 130, 130],
	[1, 5],
	[2, 3],
	[3, 4],
	[5, 6],
	[6, 7],
	[1, 8],
	[8, 9],
	[9, 10],
	[1, 11],
	[11, 12],
	[12, 13],
	[1, 0],
	[0, 14],
	[14, 16],
	[0, 15],
	[15, 17],
	// [2, 16],
	// [5, 17],
]

const colors = [
	[255, 0, 0],
	[255, 85, 0],
	[255, 170, 0],
	[255, 255, 0],
	[170, 255, 0],
	[85, 255, 0],
	[0, 255, 0],
	[0, 255, 85],
	[0, 255, 170],
	[0, 255, 255],
	[0, 170, 255],
	[0, 85, 255],
	[0, 0, 255],
	[85, 0, 255],
	[170, 0, 255],
	[255, 0, 255],
	[255, 0, 170],
	[255, 0, 85],
]

const stickWidth = 4

export async function drawPose(pose: OpenPose) {
	let poses: Pose2d[]
	if (Array.isArray(pose)) {
    poses = pose
	} else if (isOpenPose(pose)) {
    poses = getPoses(pose)
	} else {
    poses = [pose]
	}

  const width = pose.width
  const height = pose.height

	const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

	const ctx = canvas.getContext("2d")
	ctx.rect(0, 0, width, height)
	ctx.fillStyle = "black"
	ctx.fill()

	for (const p of poses) {
		for (let i = 0; i < limbSeq.length; i++) {
			const [a, b] = limbSeq[i]
			const pa = p.joints[a]
			const pb = p.joints[b]

			if (!pa || !pb || pa.point.confidence < 1 || pb.point.confidence < 1) continue

			const length = Math.sqrt((pa.point.x - pb.point.x) ** 2 + (pa.point.y - pb.point.y) ** 2)
			const angle = Math.atan2(pb.point.y - pa.point.y, pb.point.x - pa.point.x)
			const center = { x: (pa.point.x + pb.point.x) / 2, y: (pa.point.y + pb.point.y) / 2 }

			ctx.beginPath()
			ctx.ellipse(center.x, center.y, length / 2, 4, angle, 0, 2 * Math.PI)
			ctx.fillStyle = `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, 0.6)`
			ctx.fill()
		}

		for (let i = 0; i < p.joints.length; i++) {
			const joint = p.joints[i]
			ctx.beginPath()
			ctx.ellipse(joint.point.x, joint.point.y, stickWidth, stickWidth, 0, 0, 2 * Math.PI)
			ctx.fillStyle = `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, 0.6)`
			ctx.fill()
		}
	}

	const buffer = await canvasToBuffer(canvas, "image/png")

	return buffer
}

async function canvasToBuffer(canvas: HTMLCanvasElement, type: string) : Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      resolve(new Uint8Array(await blob.arrayBuffer()))
    }, type)
  })
}