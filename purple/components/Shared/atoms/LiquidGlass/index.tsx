import {
    Canvas,
    RoundedRect,
    RuntimeShader,
    Skia,
    useDerivedValue,
    useValue,
    vec,
} from '@shopify/react-native-skia';
import React, { ReactNode } from 'react';
import { Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface LiquidGlassProps {
    /** Width of the glass viewport in logical px. */
    width: number;
    /** Height of the glass viewport in logical px. */
    height: number;
    /** Border‑radius. Defaults to a fully pill‑shaped capsule. */
    borderRadius?: number;
    /** Optional external style (positioning, drop‑shadow, etc.)  */
    style?: StyleProp<ViewStyle>;
    /** Children are laid out *inside* the glass; set pointerEvents
     *  to "none" if you want touches to fall through.            */
    children?: ReactNode;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
    width,
    height,
    borderRadius = Math.min(width, height) / 2,
    style,
    children,
}) => {
    // Shared translation values (screen px)
    const tx = useSharedValue((Dimensions.get('window').width - width) / 2);
    const ty = useSharedValue((Dimensions.get('window').height - height) / 2);

    // Clamp inside safe viewport bounds (10px padding)
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const pan = Gesture.Pan()
        .onBegin(() => {
            tx.value = withSpring(tx.value, { damping: 20, stiffness: 300 });
            ty.value = withSpring(ty.value, { damping: 20, stiffness: 300 });
        })
        .onUpdate((e) => {
            const maxX = Dimensions.get('window').width - width - 10;
            const maxY = Dimensions.get('window').height - height - 10;
            tx.value = clamp(tx.value + e.changeX, 10, maxX);
            ty.value = clamp(ty.value + e.changeY, 10, maxY);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        left: tx.value,
        top: ty.value,
        width,
        height,
        // Let callers add shadows / etc.
    }));

    /*────────────────  Skia Runtime Shader  ────────────────*/
    const shaderSrc = `
    uniform shader image;          // back‑drop snapshot from Skia
    uniform vec2  resolution;      // {w, h} in px
    uniform vec2  pointer;         // 0‑1, current touch pos

    // Signed distance to rounded‑rect (same math as web demo)
    float roundedRectSDF(vec2 p, vec2 b, float r) {
      vec2 d = abs(p) - (b - r);
      return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
    }

    half4 main(vec2 fragCoord) {
      vec2 uv = fragCoord / resolution;       // 0‑1
      vec2 pos = uv - 0.5;

      // Center‑based SDF; tweak to taste
      float dist = roundedRectSDF(pos, vec2(0.3, 0.2), 0.25);
      float disp  = smoothstep(0.6, 0.0, dist - 0.1);

      // Basic radial displacement toward center
      vec2 dir = pos * disp * 0.12;
      vec2 displaced = uv + dir;

      // Sample underlying scene via backdrop input shader
      return image.eval(displaced * resolution);
    }`;

    // Compile once (kept stable across renders)
    const runtimeEffect = Skia.RuntimeEffect.Make(shaderSrc);
    if (!runtimeEffect) throw new Error('Failed to compile shader');

    // Uniforms that Skia expects as mutable values
    const res = useValue(vec(width, height));

    // No pointer (touch) interaction in shader right now, but the
    // uniform is left for future expansion (mouse‑like effect).
    const pointer = useValue(vec(0.5, 0.5));

    const uniforms = useDerivedValue(
        () => ({
            resolution: res.current,
            pointer: pointer.current,
        }),
        [res, pointer],
    );

    /*────────────────────────────────────────────────────────*/
    return (
        <GestureHandlerRootView /* ensures gestures work inside Modal */>
            <GestureDetector gesture={pan}>
                <Animated.View style={[animatedStyle, style] as any}>
                    {/*
			              canvas sits above children so it can blur
			              the backdrop. children are rendered normally.
			          */}
                    <Canvas style={StyleSheet.absoluteFill}>
                        <RuntimeShader source={runtimeEffect} uniforms={uniforms} />
                        <RoundedRect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            r={borderRadius}
                            // Semi‑transparent fill gives the classic glass tint
                            color='rgba(255,255,255,0.15)'
                        />
                    </Canvas>

                    {/* Render wrapped elements */}
                    {children}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

export default LiquidGlass;
