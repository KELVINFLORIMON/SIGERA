from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict, Any
from app.models.enums import SituacionFinalTipo, NivelDesempenoTipo

class MotorCalculo:
    """
    Motor de cálculo académico de SIGERA.
    Implementa estrictamente las reglas de evaluación de la Ordenanza 04-2023.
    Adaptado para 4 Grupos de Competencias (GC1-GC4).
    """
    NOTA_MINIMA = 70
    NOTA_MAXIMA = 100

    @staticmethod
    def _redondear(valor: float) -> int:
        """Redondeo estándar: 0.5 hacia arriba para enteros."""
        return int(Decimal(str(valor)).quantize(Decimal('1'), rounding=ROUND_HALF_UP))

    @staticmethod
    def _redondear_decimal(valor: float) -> float:
        """Redondeo con 1 decimal: 0.05 hacia arriba."""
        return float(Decimal(str(valor)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))

    @staticmethod
    def nota_efectiva(nota_periodo: Optional[int], nota_recuperacion: Optional[int]) -> Optional[int]:
        """
        Devuelve la nota que debe usarse para promediar.
        """
        if nota_periodo is None:
            return None
        if nota_periodo >= MotorCalculo.NOTA_MINIMA:
            return nota_periodo
        return nota_recuperacion if nota_recuperacion is not None else nota_periodo

    @staticmethod
    def es_periodo_completo(nota: Optional[int], rp: Optional[int]) -> bool:
        if nota is None:
            return False
        if nota < MotorCalculo.NOTA_MINIMA and rp is None:
            return False
        return True

    @staticmethod
    def promedio_competencia(lista_completos: List[bool], notas_efectivas: List[Optional[int]]) -> Optional[float]:
        """
        Calcula el Promedio de Competencia (PC) de un Grupo de Competencia.
        Promedia P1, P2, P3, P4 de ese grupo.
        Solo calcula el promedio si los 4 períodos están completos en ese grupo.
        """
        if not all(lista_completos):
            return None
            
        notas_validas = [n for n in notas_efectivas if n is not None]
        if len(notas_validas) < 4:
            return None
        promedio = sum(notas_validas) / len(notas_validas)
        return MotorCalculo._redondear_decimal(promedio)
        
    @staticmethod
    def calificacion_final_asignatura(promedios_competencias: List[Optional[float]]) -> Optional[int]:
        """
        Promedio de los 4 PC (PC1, PC2, PC3, PC4).
        Requiere que los 4 PC estén calculados.
        """
        pcs_validos = [pc for pc in promedios_competencias if pc is not None]
        if len(pcs_validos) < 4:
            return None
        promedio = sum(pcs_validos) / len(pcs_validos)
        return MotorCalculo._redondear(promedio)

    @staticmethod
    def nivel_desempeno(calificacion: Optional[int]) -> NivelDesempenoTipo:
        """Asigna el Nivel de Desempeño según la calificación final."""
        if calificacion is None:
            return NivelDesempenoTipo.SIN_EVALUAR
        if calificacion >= 89:
            return NivelDesempenoTipo.DESTACADO
        if calificacion >= 77:
            return NivelDesempenoTipo.LOGRADO
        if calificacion >= 70:
            return NivelDesempenoTipo.EN_PROCESO
        return NivelDesempenoTipo.INSUFICIENTE

    @staticmethod
    def requiere_recuperacion(nota: Optional[int]) -> bool:
        if nota is None:
            return False
        return nota < MotorCalculo.NOTA_MINIMA

    @staticmethod
    def determinar_situacion_final(cf: Optional[int], cec: Optional[int] = None, ceex: Optional[int] = None, ce: Optional[int] = None) -> SituacionFinalTipo:
        """Determina si aprobó o va a completiva/extraordinaria/especial."""
        if cf is None:
            return SituacionFinalTipo.PENDIENTE
        
        if cf >= MotorCalculo.NOTA_MINIMA:
            return SituacionFinalTipo.APROBADO
            
        # Si tiene nota especial
        if ce is not None:
            return SituacionFinalTipo.APROBADO if ce >= MotorCalculo.NOTA_MINIMA else SituacionFinalTipo.REPROBADO
            
        # Si tiene nota extraordinaria
        if ceex is not None:
            cexf = MotorCalculo._redondear(cf * 0.3 + ceex * 0.7)
            if cexf >= MotorCalculo.NOTA_MINIMA:
                return SituacionFinalTipo.APROBADO
            # Si reprobó extraordinaria, su estado es REPROBADO hasta que tome Especial
            return SituacionFinalTipo.REPROBADO
            
        # Si tiene nota completiva
        if cec is not None:
            ccf = MotorCalculo._redondear(cf * 0.5 + cec * 0.5)
            if ccf >= MotorCalculo.NOTA_MINIMA:
                return SituacionFinalTipo.APROBADO
            # Si reprobó completiva, su estado es EN_EXTRAORDINARIA (aunque nuestro enum solo tiene completiva, let's use EN_COMPLETIVA for now or add extra)
            # Wait, MINERD situacion final uses REPROBADO if they fail completiva and don't go to extraordinaria? 
            # We only have EN_COMPLETIVA and REPROBADO for failed states in our enum. We will use REPROBADO if they fail a stage until they enter the next.
            return SituacionFinalTipo.REPROBADO
            
        return SituacionFinalTipo.EN_COMPLETIVA

    @staticmethod
    def procesar_calificaciones_asignatura(grupos_datos: List[Dict[str, Any]], cec: Optional[int] = None, ceex: Optional[int] = None, ce: Optional[int] = None) -> Dict[str, Any]:
        """
        Recibe una lista de 4 diccionarios (uno por GC) y calcula PC por grupo y CF global.
        """
        resultados_grupos = []
        pcs = []
        
        for grupo in grupos_datos:
            p1, rp1 = grupo.get('p1'), grupo.get('rp1')
            p2, rp2 = grupo.get('p2'), grupo.get('rp2')
            p3, rp3 = grupo.get('p3'), grupo.get('rp3')
            p4, rp4 = grupo.get('p4'), grupo.get('rp4')
            
            c1 = MotorCalculo.es_periodo_completo(p1, rp1)
            c2 = MotorCalculo.es_periodo_completo(p2, rp2)
            c3 = MotorCalculo.es_periodo_completo(p3, rp3)
            c4 = MotorCalculo.es_periodo_completo(p4, rp4)
            lista_completos = [c1, c2, c3, c4]

            ne1 = MotorCalculo.nota_efectiva(p1, rp1)
            ne2 = MotorCalculo.nota_efectiva(p2, rp2)
            ne3 = MotorCalculo.nota_efectiva(p3, rp3)
            ne4 = MotorCalculo.nota_efectiva(p4, rp4)
            lista_ne = [ne1, ne2, ne3, ne4]
            
            pc = MotorCalculo.promedio_competencia(lista_completos, lista_ne)
            pcs.append(pc)
            
            resultados_grupos.append({
                "grupo_competencia_id": grupo.get('grupo_competencia_id'),
                "nota_p1": p1, "nota_rp1": rp1,
                "nota_p2": p2, "nota_rp2": rp2,
                "nota_p3": p3, "nota_rp3": rp3,
                "nota_p4": p4, "nota_rp4": rp4,
                "promedio_competencia": pc
            })
            
        cf = MotorCalculo.calificacion_final_asignatura(pcs)
        situacion = MotorCalculo.determinar_situacion_final(cf, cec, ceex, ce)
        nivel = MotorCalculo.nivel_desempeno(cf)

        return {
            "grupos": resultados_grupos,
            "calificacion_final": cf,
            "situacion_final": situacion,
            "nivel_desempeno": nivel
        }
