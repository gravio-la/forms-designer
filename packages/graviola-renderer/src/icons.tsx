import { ToolIconComponent, ToolIconRegistry } from "@formswizard/types"
import { SvgIcon, SxProps, Theme } from "@mui/material"
import { ComponentType, SVGAttributes } from "react"

const getVariantSvgStyles: (variant: 'outlined' | 'filled') => SVGAttributes<SVGSVGElement> = (variant) => {
  switch (variant) {
    case 'outlined':
      return {
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '2',
      }
    case 'filled':
    default:
      return {
        fill: 'currentColor',
        stroke: 'none',
      }
  }
}
const defaultSvgStyles: SVGAttributes<SVGSVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
}

type SVGIconComponent = ComponentType<{
  variant?: 'outlined' | 'filled'
}>

// ManyToMany Icon - supports both outlined and filled variants
const ManyToManyIconSvg: SVGIconComponent = ({ variant = 'outlined' }) => {
  if (variant === 'filled') {
    return <svg {...defaultSvgStyles} fill="currentColor">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zm-3.2 5.4c-.577 -.769 -1.8 -.361 -1.8 .6v4a1 1 0 0 0 1 1l.117 -.007a1 1 0 0 0 .883 -.993v-1l1.2 1.6c.577 .769 1.8 .361 1.8 -.6v-4a1 1 0 0 0 -1 -1l-.117 .007a1 1 0 0 0 -.883 .993v1zm-9 0c-.577 -.769 -1.8 -.361 -1.8 .6v4a1 1 0 0 0 1 1l.117 -.007a1 1 0 0 0 .883 -.993v-1l1.2 1.6c.577 .769 1.8 .361 1.8 -.6v-4a1 1 0 0 0 -1 -1l-.117 .007a1 1 0 0 0 -.883 .993v1zm5.2 3.1a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m0 -3a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1" />
    </svg>
  }
  
  return <svg {...defaultSvgStyles} {...getVariantSvgStyles(variant)}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M15 14v-4l3 4v-4" />
    <path d="M6 14v-4l3 4v-4" />
    <path d="M12 10.5l0 .01" />
    <path d="M12 13.5l0 .01" />
  </svg>
}

// OneToMany Icon - supports both outlined and filled variants
const OneToManyIconSvg: SVGIconComponent = ({ variant = 'outlined' }) => {
  if (variant === 'filled') {
    return <svg {...defaultSvgStyles} fill="currentColor">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zm-4.2 5.4c-.577 -.769 -1.8 -.361 -1.8 .6v4a1 1 0 0 0 1 1l.117 -.007a1 1 0 0 0 .883 -.993v-1l1.2 1.6c.577 .769 1.8 .361 1.8 -.6v-4a1 1 0 0 0 -1 -1l-.117 .007a1 1 0 0 0 -.883 .993v1zm-6.8 -.4h-1a1 1 0 1 0 0 2v3a1 1 0 0 0 2 0v-4a1 1 0 0 0 -1 -1m3 3.5a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1m0 -3a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1" />
    </svg>
  }
  
  return <svg {...defaultSvgStyles} {...getVariantSvgStyles(variant)}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M7 10h1v4" />
    <path d="M14 14v-4l3 4v-4" />
    <path d="M11 10.5l0 .01" />
    <path d="M11 13.5l0 .01" />
  </svg>
}

const makeSvgIcon = (SvgComponent: SVGIconComponent): ToolIconComponent => {
  return ({ sx, variant = 'outlined' }: { sx?: SxProps<Theme>, variant?: 'outlined' | 'filled' }) => {
    return <SvgIcon component={SvgComponent} variant={variant} sx={sx} />
  }
}

const ManyToManyIcon: ToolIconComponent = makeSvgIcon(ManyToManyIconSvg)
const OneToManyIcon: ToolIconComponent = makeSvgIcon(OneToManyIconSvg)

export const graviolaComponentIcons: ToolIconRegistry = {
  ManyToMany: ManyToManyIcon,
  OneToMany: OneToManyIcon,
}

export const icons = graviolaComponentIcons
