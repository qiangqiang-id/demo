<template>
  <div class="dress" ref="dress" :style="actorDressStyle">
    <div v-show="editStatus">
      <!-- 左上角 \-->
      <span
        class="dress-point leftTop"
        :style="{ cursor: cursorStyle[0] }"
        @mousedown.stop="(e) => dragCorner(e, EPosition.LEFTOP)"
      />
      <!-- 上中点 -->
      <span
        class="topChunk"
        :style="{ cursor: cursorStyle[1] }"
        @mousedown.stop="(e) => dragCenter(e, EPosition.TOPCENTER)"
      />
      <!-- 右上角 / -->
      <span
        class="dress-point rightTop"
        :style="{ cursor: cursorStyle[2] }"
        @mousedown.stop="(e) => dragCorner(e, EPosition.RIGHTTOP)"
      />
      <!-- 右中点 -->
      <span
        class="rightChunk"
        :style="{ cursor: cursorStyle[3] }"
        @mousedown.stop="(e) => dragCenter(e, EPosition.RIGHTCENTER)"
      />
      <!-- 右下角 \-->
      <span
        class="dress-point rightBottom"
        :style="{ cursor: cursorStyle[0] }"
        @mousedown.stop="(e) => dragCorner(e, EPosition.RIGHTBOTTOM)"
      />
      <!-- 底中点 -->
      <span
        class="bottomChunk"
        :style="{ cursor: cursorStyle[1] }"
        @mousedown.stop="(e) => dragCenter(e, EPosition.BOTTOMCENTER)"
      />
      <!-- 左下角 /-->
      <span
        class="dress-point leftBottom"
        :style="{ cursor: cursorStyle[2] }"
        @mousedown.stop="(e) => dragCorner(e, EPosition.LEFTBOTTOM)"
      />
      <!-- 左中点 -->
      <span
        class="leftChunk"
        :style="{ cursor: cursorStyle[3] }"
        @mousedown.stop="(e) => dragCenter(e, EPosition.LEFTCENTER)"
      />

      <!-- 旋转区域 -->
      <div class="rotateArea" @mousedown.stop="dragRotate">
        <img src="@/assets/picture/stage/icon_rotate.png" alt="rotateIcon" />
      </div>
    </div>
    <!-- 旋转角度，预览信息-->
    <div class="rotateTips" v-show="spinStatus" :style="tipsStyle">
      {{ previewAngle }}°
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue, Watch } from "vue-property-decorator";
import { dragAction } from "@/utils/drag";
import { EPosition } from "@/types/base/basicEnum";
import {
  IActor,
  IActorType,
  ICoordinate,
  IDimension,
} from "@/types/base/newBasic";
import {
  PrevSave,
  RotatedScaleHandler,
  RotatedStretchHandler,
  RotateHandler,
  ScaleHandler,
  StretchHandler,
} from "@/lib/handler";

import {
  getScaledPosition,
  calculateRotatedPointCoordinate,
} from "@/lib/handler/scaleHandle";

import { INIT_ANGLE, ANGLE_CURSOR } from "./const.js";
import {
  calcRotatedPoint,
  findRectPosition,
  rotationToAngle,
} from "@/lib/handler/helper";
import { keepDecimal } from "@/utils/utils";
import { undoRedoStore, StepDataDS } from "@/store/modules/toolUndoRedo";

@Component({
  name: "ActorDress",
  components: {},
  inheritAttrs: false,
})
export default class ActorDress extends Vue {
  @Prop(Boolean) private isEdit!: boolean; // 是否为编辑状态
  @PropSync("isEdit") editStatus; // 同步编辑状态

  private EPosition = EPosition; // 位置枚举值
  private tipsStyle = {}; // 预览信息样式
  private spinStatus = false; // 旋转状态
  private prevPosition: any = {}; // 暂时存储的位置信息
  private prevAngle = 0; // 暂存的旋转角度
  private previewAngle = 0; // 预览旋转角度
  private miniSize: IDimension = {
    // 缩小后的最小值
    width: 20,
    height: 20,
  };

  // 获取内容区id
  private get idSelector(): string {
    return `contentBox-${this.$attrs.index}`;
  }

  // 获取元素类型
  private get actorType(): IActorType {
    return this.actorData.type;
  }

  // 获取缩放值
  private get scaleNum(): number {
    return (this.$attrs as any).scaleNum;
  }

  // 获取宽高比
  private get ratio(): number {
    return this.actorData.width / this.actorData.height;
  }

  // 获取正确的x坐标
  private get computedX(): number {
    const { data } = this.$attrs as any;
    if (data.anchor.x !== 0) {
      return (data.x - data.width * data.anchor.x) * this.scaleNum;
    }
    return data.x * this.scaleNum;
  }

  // 获取正确的y坐标
  private get computedY(): number {
    const { data } = this.$attrs as any;
    if (data.anchor.y !== 0) {
      return (data.y - data.height * data.anchor.y) * this.scaleNum;
    }
    return data.y * this.scaleNum;
  }

  // 获取元素信息
  private get actorData(): IActor {
    const { data } = this.$attrs as any;
    return {
      x: this.computedX,
      y: this.computedY,
      width: data.width * this.scaleNum,
      height: data.height * this.scaleNum,
      rotation: data.rotation,
      anchor: data.anchor,
      type: data.type,
      id: data.id,
      scale: data.scale,
    };
  }

  // 获取编辑框样式信息
  private get actorDressStyle(): any {
    return {
      width: `${this.actorData.width}px`,
      height: `${this.actorData.height}px`,
      transform: `translate(${this.computedX}px, ${this.computedY}px) rotate(${
        this.angle
      }deg)
                  scaleX(${
                    (this.actorData.scale as Required<IActor>).x > 0 ? 1 : -1
                  })
                  scale(${
                    (this.actorData.scale as Required<IActor>).y > 0 ? 1 : -1
                  }`,
      // transformOrigin: `${0.5 * 100}% ${0.5 * 100}%`,
    };
  }

  // 获取旋转角度
  private get angle(): number {
    return keepDecimal(rotationToAngle(this.actorData.rotation), 0);
  }

  // 判断是否旋转过
  private get isRotated(): boolean {
    return this.actorData.rotation !== 0;
  }

  // 获取最新的anchor坐标
  private get anchorX(): number {
    return this.actorData.anchor.x;
  }

  // 获取指针样式
  private get cursorStyle(): string[] {
    let angle = this.angle;
    const cursors: string[] = [];
    if (this.angle < 0) {
      angle += 360;
    }

    INIT_ANGLE.forEach((a) => {
      const newAngle = (a + angle) % 360;
      const item = ANGLE_CURSOR.find(
        (i) => i.start <= newAngle && i.end >= newAngle
      );
      item && cursors.push(item.cursor);
    });
    return cursors;
  }

  // 更新元素信息
  private updateInfo(data: Partial<IActor>) {
    this.$emit("update", data);
  }

  // 转换器，对某些传回的数据进行转换, 除以缩放值
  private getConvertedData(
    data: Omit<IActor, "rotation" | "anchor">
  ): Omit<IActor, "rotation" | "anchor"> {
    const attributes = ["x", "y", "width", "height"];
    return attributes.reduce((prev: any, cur: any) => {
      if (data[cur]) {
        prev[cur] = data[cur] / this.scaleNum;
      }
      return prev;
    }, {});
  }

  // 计算得出新坐标基于anchor(x:0.5, y:0.5)
  private repositionAnchor(): Omit<IActor, "rotation" | "type"> {
    // const rectPosition = findRectPosition(this.idSelector, false)
    // return {
    //   x: (rectPosition.x + rectPosition.width / 2) / this.scaleNum, // 定位中心点的x
    //   y: (rectPosition.y + rectPosition.height / 2) / this.scaleNum, // 定位中心点的y
    //   width: this.actorData.width / this.scaleNum,
    //   height: this.actorData.height / this.scaleNum,
    //   anchor: { x: 0.5, y: 0.5 },
    // }
    const { data } = this.$attrs as any;
    const poi = calcRotatedPoint(
      {
        x: data.x + data.width * (0.5 - data.anchor.x),
        y: data.y + data.height * (0.5 - data.anchor.y),
      },
      {
        x: data.x,
        y: data.y,
      },
      (data.rotation * 180) / Math.PI
    );
    return {
      x: poi.x, // 定位中心点的x
      y: poi.y, // 定位中心点的y
      width: data.width,
      height: data.height,
      anchor: { x: 0.5, y: 0.5 },
    };
  }

  // 旋转后，计算得出新坐标基于anchor(x:0, y:0)
  private repositionRegularRotated(): Omit<IActor, "rotation" | "type"> {
    const rectPosition = findRectPosition(this.idSelector, false);
    const centerPos = {
      x: rectPosition.x + rectPosition.width / 2, // 定位元素中心点的x
      y: rectPosition.y + rectPosition.height / 2, // 定位元素中心点的y
    };
    const rotatedAngle = this.angle - this.prevAngle;
    const newCenter = calcRotatedPoint(
      centerPos,
      { x: this.prevPosition.x, y: this.prevPosition.y },
      rotatedAngle
    );
    const offset = {
      x: centerPos.x - newCenter.x,
      y: centerPos.y - newCenter.y,
    };

    return {
      x: (this.prevPosition.x + offset.x) / this.scaleNum,
      y: (this.prevPosition.y + offset.y) / this.scaleNum,
      width: this.prevPosition.width / this.scaleNum,
      height: this.prevPosition.height / this.scaleNum,
      anchor: { x: 0, y: 0 },
    };
  }

  // 计算出新坐标基于anchor(x: 0, y: 0 }
  private repositionRegular(
    newPosition: any
  ): Omit<IActor, "rotation" | "type"> {
    const rectPosition = findRectPosition(this.idSelector, false);
    const centerPos = {
      x: rectPosition.x + rectPosition.width / 2, // 定位元素中心点的x
      y: rectPosition.y + rectPosition.height / 2, // 定位元素中心点的y
    };
    const newCenter = calcRotatedPoint(
      centerPos,
      { x: this.actorData.x, y: this.actorData.y },
      this.angle
    );
    const offset = {
      x: centerPos.x - newCenter.x,
      y: centerPos.y - newCenter.y,
    };
    return {
      x: (this.actorData.x + offset.x) / this.scaleNum,
      y: (this.actorData.y + offset.y) / this.scaleNum,
      width: newPosition.width,
      height: newPosition.height,
      anchor: { x: 0, y: 0 },
    };
  }

  // 更新预览信息的角度
  private updateTipsStyle(angle: number) {
    this.tipsStyle = { transform: `translateX(-50%) rotate(${-angle}deg)` };
  }

  // mounted () {
  //   setTimeout(()=> {
  //     console.log('x', this.$attrs, this.$listeners, this.isEdit)
  //   }, 200)
  // }

  private getPoint(rect, center, position) {
    let point;

    switch (position) {
      case EPosition.LEFTOP:
        point = {
          x: rect.x,
          y: rect.y,
        };
        return calculateRotatedPointCoordinate(point, center, rect.rotate);
    }
  }

  private getKeyVariable(data, type) {
    const x = data.x;
    const y = data.y;
    const rect = {
      x: x * this.scaleNum,
      y: y * this.scaleNum,
      width: data.width * this.scaleNum,
      height: data.height * this.scaleNum,
      rotate: data.rotation,
    };

    const center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };

    const handlePoint = this.getPoint(rect, center, type);

    const sPoint = {
      x:
        center.x +
        Math.abs(handlePoint.x - center.x) *
          (handlePoint.x < center.x ? 1 : -1),
      y:
        center.y +
        Math.abs(handlePoint.y - center.y) *
          (handlePoint.y < center.y ? 1 : -1),
    };

    return {
      //  viewportRef, // 页面SVG元素的引用（计算鼠标位置需要用到）
      rect, // 元素原始几何信息（xy宽高）
      center, // 元素原始中心点坐标
      handlePoint, // 当前拖动手柄的虚拟坐标（旋转后的坐标）
      sPoint, // 拖动手柄的对称点的坐标（假设拖动的是左上角手柄，那么他的对称点就是右下角的点）
      proportion: 1, // 宽高比
    };
  }

  // 更新拖拽编辑框后的元素信息
  private dragCorner(e: MouseEvent, position: EPosition) {
    let newPosition: any = {};

    const scaleHandler: RotatedScaleHandler | ScaleHandler = this.isRotated
      ? new RotatedScaleHandler(
          this.miniSize,
          this.ratio,
          position,
          new PrevSave(this.idSelector, e)
        )
      : new ScaleHandler(this.actorData, this.miniSize, this.ratio, position);
    //
    const { data } = this.$attrs as any;

    // const { sPoint, rect } = this.getKeyVariable(data, position)

    const URStepData: StepDataDS = {
      From: {
        type: undoRedoStore.ActionData.update,
        id: data.id,
        data: {
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
        },
      },
      To: {
        type: undoRedoStore.ActionData.update,
        id: data.id,
        data: {},
      },
    };

    dragAction(e, {
      init: (e) => {
        this.isRotated && this.updateInfo(this.repositionAnchor());
        return { x: e.x, y: e.y };
      },

      move: (newEvent: MouseEvent, prev: MouseEvent) => {
        const now: ICoordinate = { x: newEvent.x, y: newEvent.y };
        const offset: ICoordinate = {
          x: now.x - prev.x,
          y: now.y - prev.y,
        };
        const scaledResult = scaleHandler.checkScale(
          this.isRotated ? now : offset,
          this.actorData
        );
        const validResult = scaledResult !== undefined;
        if (validResult) {
          newPosition = this.getConvertedData(scaledResult);
          newPosition && this.updateInfo(newPosition);
        }
        return now;

        // let data = getScaledPosition({ sPoint, event: newEvent, rotate: rect.rotate })

        // newPosition = this.getConvertedData(data)

        // console.log(newPosition, this.scaleNum)

        // newPosition && this.updateInfo(newPosition)
      },

      end: () => {
        console.log("完成四角拖拽");
        URStepData.To.data.x = newPosition.x;
        URStepData.To.data.y = newPosition.y;
        URStepData.To.data.width = newPosition.width;
        URStepData.To.data.height = newPosition.height;
        undoRedoStore.ADD_STEP([URStepData]);
        this.isRotated && this.updateInfo(this.repositionRegular(newPosition));
      },
    });
  }

  // 更新拖边框四边中点后的元素信息
  private dragCenter(e: MouseEvent, position: EPosition) {
    console.log("拖拽边位置", position);
    let newPosition: any = {};
    const stretchHandler: RotatedStretchHandler | StretchHandler = this
      .isRotated
      ? new RotatedStretchHandler(
          this.miniSize,
          position,
          new PrevSave(this.idSelector, e)
        )
      : new StretchHandler(this.miniSize, position);
    dragAction(e, {
      init: (e) => {
        this.isRotated && this.updateInfo(this.repositionAnchor());
        return { x: e.clientX, y: e.clientY };
      },
      move: (newEvent: MouseEvent, prev: MouseEvent) => {
        const now: ICoordinate = { x: newEvent.x, y: newEvent.y };
        const offSet: ICoordinate = {
          x: now.x - prev.x,
          y: now.y - prev.y,
        };
        const stretchedResult = stretchHandler.checkStretch(
          this.isRotated ? now : offSet,
          this.actorData
        );
        console.log("stretchedResult", stretchedResult);
        const validResult = stretchedResult !== undefined;
        if (validResult) {
          newPosition = this.getConvertedData(stretchedResult);
          newPosition && this.updateInfo(newPosition);
        }
        return now;
      },
      end: () => {
        console.log("完成四边拖拽");
        this.isRotated && this.updateInfo(this.repositionRegular(newPosition));
      },
    });
  }

  // 更新旋转后的元素信息
  private dragRotate(e: MouseEvent) {
    const rotateHandler = new RotateHandler();
    this.previewAngle = this.angle; // 显示预览旋转角度
    this.prevAngle = this.angle; // 暂存旋转前的角度
    this.prevPosition = {
      // 暂存旋转前的位置信息
      x: this.actorData.x,
      y: this.actorData.y,
      width: this.actorData.width,
      height: this.actorData.height,
    };

    const { data } = this.$attrs as any;
    const URStepData: StepDataDS = {
      From: {
        type: undoRedoStore.ActionData.update,
        id: data.id,
        data: {
          x: this.actorData.x,
          y: this.actorData.y,
          rotation: this.angle,
        },
      },
      To: {
        type: undoRedoStore.ActionData.update,
        id: data.id,
        data: {},
      },
    };
    let UndoRedoRotation = this.angle;

    dragAction(e, {
      init: (e) => {
        this.editStatus = false;
        this.spinStatus = true;
        // 转换坐标系为anchor: {x: 0.5, y: 0.5 }
        this.updateInfo(this.repositionAnchor());
        return { x: e.clientX, y: e.clientY };
      },
      move: (newEvent: MouseEvent) => {
        const now = { x: newEvent.clientX, y: newEvent.clientY };
        const { angle, rotation } = rotateHandler.checkRotate(now, this.$el);
        this.previewAngle = angle;
        UndoRedoRotation = rotation;
        this.updateInfo({ rotation });
        this.updateTipsStyle(angle);
        return now;
      },
      end: () => {
        this.editStatus = true;
        this.spinStatus = false;
        // 转换坐标系为anchor: {x: 0, y: 0 }
        let newTransition = this.repositionRegularRotated();
        URStepData.To.data.y = newTransition.y;
        URStepData.To.data.x = newTransition.x;
        URStepData.To.data.rotation = UndoRedoRotation;
        undoRedoStore.ADD_STEP([URStepData]);

        this.updateInfo(newTransition);
        console.log("完成旋转");
      },
    });
  }

  // 监听元素的坐标信息
  @Watch("anchorX")
  private anchorChange(value: number) {
    console.log("anchorX改变了", value);
  }
}
</script>

<style lang="less" scoped>
.dress {
  top: 0;
  left: 0;
  position: absolute;
  outline: 2px solid #f7103f;

  span {
    position: absolute;
    display: block;
    width: 12px;
    height: 12px;
    pointer-events: auto;
    background: transparent;
    transition: opacity 0.2s;
    user-select: none;

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      display: inline-block;
      width: 12px;
      height: 12px;
      content: "";
      background: #fff;
      border: 1px solid #c3c9cf;
      border-radius: 50%;
      box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1);
      transform: translate(-50%, -50%);
    }
  }

  .leftTop {
    top: 0;
    left: 0;
    z-index: 1;
    cursor: nwse-resize;
    transform: translate(-50%, -50%);
  }

  .rightTop {
    top: 0;
    right: 0;
    z-index: 1;
    cursor: nesw-resize;
    transform: translate(50%, -50%);
  }

  .leftBottom {
    bottom: 0;
    left: 0;
    z-index: 1;
    cursor: nesw-resize;
    transform: translate(-50%, 50%);
  }

  .rightBottom {
    right: 0;
    bottom: 0;
    z-index: 1;
    cursor: nwse-resize;
    transform: translate(50%, 50%);
  }

  .topChunk {
    top: -1px;
    left: 50%;
    cursor: ns-resize;
    transform: translate(-50%, -50%);

    &::before {
      width: 16px;
      height: 6px;
      border-radius: 4px;
    }
  }

  .rightChunk {
    top: 50%;
    right: -1px;
    width: 8px;
    height: calc(100% - 16px);
    cursor: ew-resize;
    transform: translate(50%, -50%);

    &::before {
      width: 6px;
      height: 16px;
      border-radius: 4px;
    }
  }

  .bottomChunk {
    bottom: -1px;
    left: 50%;
    width: calc(100% - 16px);
    height: 8px;
    cursor: ns-resize;
    transform: translate(-50%, 50%);

    &::before {
      width: 16px;
      height: 6px;
      border-radius: 4px;
    }
  }

  .leftChunk {
    top: 50%;
    left: -1px;
    width: 8px;
    height: calc(100% - 16px);
    cursor: ew-resize;
    transform: translate(-50%, -50%);

    &::before {
      width: 6px;
      height: 16px;
      border-radius: 4px;
    }
  }

  .rotateArea {
    pointer-events: auto;
    position: absolute;
    bottom: -40px;
    left: 50%;
    width: 24px;
    height: 24px;
    cursor: grab;
    background-color: #fff;
    border-radius: 50%;
    transform: translateX(-50%);
    img {
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    p {
      position: absolute;
      width: 24px;
      height: 24px;
      background: red;
    }
  }

  .rotateTips {
    position: absolute;
    text-align: center;
    line-height: 20px;
    bottom: -30px;
    width: 40px;
    height: 20px;
    left: 50%;
    background-color: #000;
  }
}
</style>

