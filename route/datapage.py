# -*- coding: utf-8 -*-
"""
Created on Tue Jan  8 13:12:16 2019

@author: juristec
"""

import pandas as pd
import numpy as np
import sys
import getopt
import json
from io import StringIO

MONTHS = {1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
          7: 'Jul', 8: 'Ago', 9: 'Set',10:  'Out', 11: 'Nov',12: 'Dez'}

QUARTER = {1: '1º Trimestre', 2: '1º Trimestre', 3: '1º Trimestre', 4: '2º Trimestre',
        5: '2º Trimestre', 6: '2º Trimestre', 7: '3º Trimestre', 8: '3º Trimestre',
        9: '3º Trimestre', 10: '4º Trimestre', 11: '4º Trimestre', 12: '4º Trimestre'}

#função que retorna um dígito específico
#df: dataframe
#target_col: coluna que será criada
#source_col: coluna que sera consultada
#index: dígito desejado
#default: valor que será colocado no caso de erro
def get_params():
    inputfile = None
    cmd = None
    arguments = dict()
    try:
        opts, args = getopt.getopt(sys.argv[1:], "m:d:", [
                                   "input=", "command=", "targetcol=", "sourcecol=", "depara=", "src1=", "src2=", "cond=", "dateformat=", "def=", "name=", "index="])
    except getopt.GetoptError:
        print('datapage.py -i <inputfile> -o <outputfile>')
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-i", "--input"):
            inputfile = arg
        elif opt in ("-c", "--command"):
            cmd = arg
        else:
            arguments.update({opt: arg})
    return (inputfile, cmd, arguments)


def getDigit(df, target_col, source_col, index, default):
    df[target_col] = df[source_col].apply( lambda x: x[index] if pd.notnull(x) and len(x) > index - 1 and x[index].isdigit() else default )
    return df

def dePara (df, target_col, source_col, filepath, default):
    df3 = pd.read_csv(filepath, sep=';', encoding='ISO-8859-1')
    #df3 = df3.astype(str)
    df3_cols = df3.columns.values.tolist()
    depara = dict(zip(df3[df3_cols[0]], df3[df3_cols[1]]))    
    df[target_col] = df[source_col].apply( lambda x: depara[x] if x in depara else default )
    return df

def getIf (df, target_col, src1, src2, cond):
    if cond[0] == 'c2v':
        if cond[2] == '==':
            df[target_col] = np.where(df[cond[1]]==cond[3], df[src1], df[src2])
        elif cond[2] == '>=':
            df[target_col] = np.where(df[cond[1]]>=cond[3], df[src1], df[src2])
        elif cond[2] == '<=':
            df[target_col] = np.where(df[cond[1]]<=cond[3], df[src1], df[src2])
        elif cond[2] == '>':
            df[target_col] = np.where(df[cond[1]]>cond[3], df[src1], df[src2])
        elif cond[2] == '<':
            df[target_col] = np.where(df[cond[1]]<cond[3], df[src1], df[src2])
        elif cond[2] == '!=':
            df[target_col] = np.where(df[cond[1]]!=cond[3], df[src1], df[src2])    
    else:
        if cond[2] == '==':
            df[target_col] = np.where(df[cond[1]]==df[cond[3]], df[src1], df[src2])
        elif cond[2] == '>=':
            df[target_col] = np.where(df[cond[1]]>=df[cond[3]], df[src1], df[src2])
        elif cond[2] == '<=':
            df[target_col] = np.where(df[cond[1]]<=df[cond[3]], df[src1], df[src2])
        elif cond[2] == '>':
            df[target_col] = np.where(df[cond[1]]>df[cond[3]], df[src1], df[src2])
        elif cond[2] == '<':
            df[target_col] = np.where(df[cond[1]]<df[cond[3]], df[src1], df[src2])
        elif cond[2] == '!=':
            df[target_col] = np.where(df[cond[1]]!=df[cond[3]], df[src1], df[src2])    
    return df
#df = dePara(df, 'UNIDADE1', 'PLATAFORMA2', 'C:/Users/juristec/Desktop/plataforma_unidade.csv', 'OUTROS')
#df = dePara(df, 'UNIDADE2', 'RAZAO', 'C:/Users/juristec/Desktop/razao_unidade.csv', 'OUTROS')
#df = getIf(df, 'UNIDADEX', 'UNIDADE2', 'UNIDADE1', ['c2v', 'PLATAFORMA', '==', '0'])
def getTrimYear(row):
    return QUARTER[row['month']]+' '+str(row['year'])

def getDate (df, target_col, source_col, data_format):
    if data_format == 'year':        
        df[target_col] = pd.DatetimeIndex(df[source_col]).year
    elif data_format == 'month':    
        df[target_col] = pd.DatetimeIndex(df[source_col]).month
    elif data_format == 'day':    
        df[target_col] = pd.DatetimeIndex(df[source_col]).day
    elif data_format == 'quarter':
        df[target_col] = pd.DatetimeIndex(df[source_col]).month
        df[target_col] = df[target_col].apply( lambda x: int(((x-1)/3)+1) )
    elif data_format == 'month-abbr':    
        df[target_col] = pd.DatetimeIndex(df[source_col]).month
        df[target_col] = df[target_col].apply( lambda x: MONTHS[x])
    elif data_format == 'quarter-abbr':
        df[target_col] = pd.DatetimeIndex(df[source_col]).month
        df[target_col] = df[target_col].apply( lambda x: QUARTER[x])
    elif data_format == 'quarter-year-abbr':
        df2 = df
        df2['y'] = pd.DatetimeIndex(df[source_col]).year
        df2['m'] = pd.DatetimeIndex(df[source_col]).month
        df[target_col] = df2.apply( getTrimYear, axis=1)

    return df

if __name__ == "__main__":
    (inputfile, cmd, args) = get_params()
    data = {}
    data = pd.read_excel(inputfile, sheetname='Metrics' );

    # data = pd.read_csv(inputfile, sep=";", encoding="ISO-8859-1")
    df_str = data.select_dtypes(['object'])
    data[df_str.columns] = df_str.apply( lambda x: x.str.strip() )

    target_col = args["--targetcol"]
    
    
    
    if cmd == "getDigit":
        index = int(args["--index"])
        default = args["--def"]
        source_col = args["--sourcecol"]
        df = getDigit(data, target_col, source_col, index, default)
        # IO = StringIO()
        # json.dump(df, IO)
        writer = pd.ExcelWriter("./temp/"+args["--name"])
        df.to_excel(writer, "Metrics")
        writer.save()
        print("OK")
    elif cmd == "depara":
        source_col = args["--sourcecol"]
        filepath = args["--depara"]
        default = args["--def"]
        df = dePara(data, target_col, source_col, filepath, default)
        writer = pd.ExcelWriter("./temp/dez2018.xlsx")
        df.to_excel(writer, "Metrics")
        writer.save()
        print(df)
    elif cmd == "getif":
        # print(json.loads(args["--cond"]))
        cond = json.loads(args["--cond"])
        _cond = [cond["type"], cond["col"], cond["op"], cond["val"]]
        df = getIf(data, target_col, args["--src1"], args["--src2"], _cond)
        writer = pd.ExcelWriter("./temp/dez2018.xlsx")
        df.to_excel(writer, "Metrics")
        writer.save()
        print(df)
    elif cmd == "getdate":
        source_col = args["--sourcecol"]
        date_format = args["--dateformat"]
        df = getDate(data, target_col, source_col, date_format)
        writer = pd.ExcelWriter("./temp/dez2018.xlsx")
        df.to_excel(writer, "Metrics")
        writer.save()
        print('OK')
    sys.stdout.flush()