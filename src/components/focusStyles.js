import { StyleSheet } from 'react-native';

const SIZE = 220;
const STROKE = 10;

export default StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020716',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
  },
  mode: { fontSize: 14, letterSpacing: 3, color: '#7A8FB3' },
  task: { fontSize: 20, fontWeight: '700', color: '#E6F7FF', marginBottom: 14 },

  dropdownWrap: { width: '100%', marginBottom: 14 },
  label: { color: '#7A8FB3', marginBottom: 4 },
  picker: { color: '#E6F7FF', backgroundColor: '#070B1A' },

  clockWrap: { width: SIZE, height: SIZE, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: 'rgba(0,240,255,0.15)' },
  progress: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: STROKE, borderColor: '#00F0FF', borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  center: { position: 'absolute' },
  time: { fontSize: 36, fontWeight: '800', color: '#00F0FF' },

  startBtn: { marginTop: 10, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 18, borderWidth: 1, borderColor: '#00F0FF' },
  startText: { color: '#00F0FF', fontWeight: '800' },

  pauseBtn: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,240,255,0.4)', marginBottom: 16 },
  pauseText: { color: '#00F0FF', fontWeight: '700' },

  endBtn: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 18, backgroundColor: '#00F0FF', marginBottom: 12 },
  endText: { color: '#020716', fontWeight: '800' },

  exit: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,95,122,0.4)', marginTop: 8 },
  exitText: { color: '#FF5F7A', fontWeight: '600' },
  volumeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  muteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: 12 },
  muteText: { color: '#E6F7FF', fontWeight: '700' },
  volControls: { flexDirection: 'row', alignItems: 'center' },
  volBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },
  volText: { color: '#E6F7FF', fontWeight: '800' },
    customTimeRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    customInput: {
      width: 120,
      height: 44,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.03)',
      color: '#E6F9FF',
      textAlign: 'center',
      fontSize: 18,
      paddingHorizontal: 12,
      marginRight: 8,
    },
    customBtn: {
      backgroundColor: '#0C1723',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 6,
      marginHorizontal: 12,
    },
    customBtnText: {
      color: '#00F0FF',
      fontWeight: '700',
      fontSize: 18,
    },
    customTimeLabel: {
      color: '#E6F9FF',
      fontSize: 16,
      fontWeight: '600',
    },
  volLabel: { color: '#7A8FB3', fontWeight: '700' },
  postSoundWrap: { width: '100%', marginTop: 12 },
  prolongBtn: {
    backgroundColor: '#00B8D9',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  prolongText: { color: '#012027', fontWeight: '800' },
});
