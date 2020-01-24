import numpy as np
import pandas as pd
import sys
import getopt
import json
import copy
from io import StringIO

def get_params():
    inputfile = None
    cmd = None
    arguments = dict()
    try:
        opts, args = getopt.getopt(sys.argv[1:], "m:d:", [
                                   "input=", "command=", "column=", "rows=", "filter=", "ext="])
    except getopt.GetoptError:
        print('script.py -i <inputfile> -o <outputfile>')
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-i", "--input"):
            inputfile = arg
        elif opt in ("-c", "--command"):
            cmd = arg
        else:
            arguments.update({opt: arg})
    return (inputfile, cmd, arguments)


if __name__ == "__main__":
    (inputfile, cmd, args) = get_params()
    data = {}
    if args['--ext'] == 'xlsx':
        # data = pd.read_excel(inputfile, sheetname='Sheet 1 - base_test2_with_year' );
        data = pd.read_excel(inputfile, sheetname='Plan 1' );

    else:
        data = pd.read_csv(inputfile, sep=";", encoding="ISO-8859-1")
        df_str = data.select_dtypes(['object'])
        
        data[df_str.columns] = df_str.apply( lambda x: x.str.strip() )
    if cmd == "upload":
        header = {}
        header["h"] = data.columns.values.tolist()
        uniques = {}
        for v in header["h"]:
            uniques[v] = data[v].unique().tolist()
        metadata = {'headers': header['h'],'uniques': uniques}
        IO = StringIO()
        json.dump(metadata, IO)
        print(IO.getvalue())
    elif cmd == "header":
        header = {}
        header['h'] = data.columns.values.tolist()
        IO = StringIO()
        json.dump(header, IO)
        print(IO.getvalue())
    elif cmd == "unique":
        column = args["--column"]
        uniques = {}
        uniques['a'] = data[column].unique().tolist()
        IO = StringIO()
        json.dump(uniques, IO)
        print(IO.getvalue())
    elif cmd == "cat":
        res_json = {}
        filtro = json.loads(args["--filter"])
        column = args["--column"]
        # filtro
        df1 = data.copy()
        for k,v in filtro.items():
            if len(v) > 0:
                df1 = df1[df1[k].isin(v)]
        if args["--rows"] == "empty":
            onlyCategory = df1.groupby(column)
            test = onlyCategory[column].count().to_dict()
            rows = [ [k, v] for k,v in test.items() ]
            res_header = ['#', 'Quantidade']
            res_json = { 'header': res_header, 
                        'rows': rows
                }
        else:
            rows = args["--rows"]
            # preparando array com dados do header (subcategorias)
            header_df = np.unique(data[rows].get_values()).tolist()
            header = {}
            for k in header_df:
                header[k] = 0
            # preparando array com dados das series
            res = {}
            colAndRows = df1.groupby([column]+[rows])
            tmp = colAndRows[column].count().to_dict()
            for k, v in tmp.items():
                res[k[0]] = copy.deepcopy(header)
            for k, v in tmp.items():
                res[k[0]][k[1]] = v
            res_data = []
            for k, v in res.items():
                res_data.append([k]+[ str(j) for j in v.values() ])

            res_json = { 'header': ['#']+header_df, 
                    'rows': res_data
                }
        IO = StringIO()
        json.dump(res_json, IO)
        print(IO.getvalue())
    sys.stdout.flush()


#media
#print(onlyCategory['PERDA_ESTIMADA'].mean())


###############################################################################
# print('colunas e linhas')
# colAndRows = df.groupby(colunas+linhas)
# print(colAndRows['ID'].count())

