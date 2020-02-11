module.exports = {
env: {
    "browser": true,
    "es6": true,
    "node": true
},
extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint"
],
plugins: [ '@typescript-eslint', "prettier" ],
parser: '@typescript-eslint/parser',
globals: {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
},
parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module"
},
"rules": {
    // exportを許可する(default exportでないときのエラーを表示させない。)
    "import/prefer-default-export": 'off',
    // thisを使っていないメソッドがstaticでないことを許可する
    'class-methods-use-this': "off",
    // importのpath指定で相対パスの使用を許可する。
    'import/no-unresolved': 'off',
    // 戻り値の型指定が無い関数を許可する。(AngularのRoutingでModuleのimportの際にWarningが出てしまうため。)
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 使用していないconstructorの存在を許可する。
    'no-useless-constructor': 'off',
    // 処理のないメソッドを許可する。
    '@typescript-eslint/no-empty-function': 'off',
    // classのプロパティ一つ一つの間隔を開けないことを許可する。
    'lines-between-class-members': 'off',
    // 1ファイルに複数のclassを書くことを許可する。(base.form.tsで必要だったため)
    'max-classes-per-file': 'off',
    // console系の警告を外す。
    'no-console': "off"
}
};