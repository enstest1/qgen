export const TRANSITION_HEIGHT=218350;
export function feeQuote({height, qtcUsd, networkFeeQtc=0.001, devFeeUsd=3}) {
  if(!Number.isSafeInteger(height)||height<0) throw Error('invalid chain height');
  if(!Number.isFinite(devFeeUsd)||devFeeUsd<0) throw Error('invalid developer fee');
  const after=height>=TRANSITION_HEIGHT;
  const protocolFee=after?{usd:25,qtc:null,description:'$25 USD-equivalent QTC at verified onchain rate'}:{usd: qtcUsd>0 ? Number((qtcUsd*.1).toFixed(2)):null,qtc:0.1,description:'0.1 QTC legacy Quark fee'};
  const networkUsd=qtcUsd>0?Number((qtcUsd*networkFeeQtc).toFixed(2)):null;
  return {phase:after?'rate-derived':'legacy', protocolFee, networkFeeQtc, networkUsd, devFeeUsd, devFeeQtc:qtcUsd>0?Number((devFeeUsd/qtcUsd).toFixed(8)):null,
  totalUsd:qtcUsd>0?Number(((after?25:qtcUsd*.1)+networkUsd+devFeeUsd).toFixed(2)):null,
  exact:false, reason:'Informational only. Wallet must independently verify Qlyphs fee, network fee and atomic developer split.'};
}
